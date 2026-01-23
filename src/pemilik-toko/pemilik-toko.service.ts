import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePemilikTokoDto } from './dto/create-pemilik-toko.dto';
import { UpdatePemilikTokoDto } from './dto/update-pemilik-toko.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { QueryPemilikTokoDto } from './dto/query-pemilik-toko.dto';
import { Prisma, Status } from '@prisma/client';
import * as fs from 'fs';
import * as bcrypt from 'bcrypt';

interface AuthorizedUser {
  id: number;
  email: string;
  roles: { name: string; rolesPermission: string[] };
}

@Injectable()
export class PemilikTokoService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}
  async create(createPemilikTokoDto: CreatePemilikTokoDto) {
    const { email, nama, tokoId, jabatan } = createPemilikTokoDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email sudah terdaftar.');
    }

    const existingToko = await this.prisma.toko.findUnique({
      where: { id: tokoId },
    });

    if (!existingToko) {
      throw new NotFoundException('Toko tidak ditemukan.');
    }

    const defaultPassword =
      this.configService.get<string>('PASSWORD_DEFAULT') || '12345678';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const [newUser, pemilik] = await this.prisma.$transaction(
      async (prisma) => {
        const createdUser = await prisma.user.create({
          data: {
            email,
            username: nama,
            password: hashedPassword,
          },
        });

        const createdPemilik = await prisma.pemilikToko.create({
          data: {
            nama: nama,
            userId: createdUser.id,
            tokoId,
            status: 'aktif',
            jabatan: jabatan ?? 'Owner',
          },
        });

        const createdRole = await prisma.userRole.create({
          data: {
            userId: createdUser.id,
            roleId: 2,
          },
        });

        return [createdUser, createdPemilik, createdRole];
      },
    );

    return {
      message: 'Pemilik Toko berhasil dibuat',
      data: pemilik,
    };
  }

  async findAll(query: QueryPemilikTokoDto, user: AuthorizedUser) {
    const { search, tokoId, status } = query;
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;

    const skip = (page - 1) * limit;
    const take = limit;

    const where: Prisma.PemilikTokoWhereInput = {};

    if (status) {
      where.status = status;
    }

    const isAdmin = user.roles.name === 'admin';

    if (isAdmin) {
      if (tokoId) {
        where.tokoId = Number(tokoId);
      }
    } else {
      if (!tokoId) {
        throw new BadRequestException('Query parameter "tokoId" wajib diisi.');
      }

      const isOwner = await this.prisma.pemilikToko.findFirst({
        where: {
          userId: user.id,
          tokoId: Number(tokoId),
        },
      });

      if (!isOwner) {
        throw new ForbiddenException(
          'Anda tidak memiliki akses ke data toko ini.',
        );
      }
      where.tokoId = Number(tokoId);
    }

    if (search) {
      where.user = {
        OR: [
          { username: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.pemilikToko.findMany({
        skip,
        take,
        where,
        include: {
          user: true,
          toko: true,
        },
      }),
      this.prisma.pemilikToko.count({ where }),
    ]);

    return {
      data: data,
      meta: {
        page,
        limit,
        totalData: total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const data = await this.prisma.pemilikToko.findUnique({
      where: { id: id },
      include: {
        user: true,
        toko: true,
      },
    });

    if (!data) {
      throw new Error('Pemilik Toko tidak ditemukan');
    }

    return data;
  }

  async update(
    id: number,
    updatePemilikTokoDto: UpdatePemilikTokoDto,
    photo?: Express.Multer.File,
  ) {
    const pemilikToko = await this.findOne(id);

    const { userId } = pemilikToko;
    const { nama, email, status, ...pemilikTokoProperties } =
      updatePemilikTokoDto;

    const userDataToUpdate: Prisma.UserUpdateInput = {};

    const pemilikTokoDataToUpdate: Prisma.PemilikTokoUpdateInput =
      pemilikTokoProperties;

    if (nama) {
      pemilikTokoDataToUpdate.nama = nama;
      userDataToUpdate.username = nama;
    }
    if (email) {
      userDataToUpdate.email = email;
    }
    if (status) pemilikTokoDataToUpdate.status = status as Status;

    if (photo) {
      userDataToUpdate.photo = photo.path;

      const oldPhotoPath = pemilikToko.user.photo;
      if (oldPhotoPath && fs.existsSync(oldPhotoPath)) {
        try {
          fs.unlinkSync(oldPhotoPath);
          console.log(`Successfully deleted old photo: ${oldPhotoPath}`);
        } catch (err) {
          console.error(`Failed to delete old photo: ${oldPhotoPath}`, err);
        }
      }
    }

    try {
      const [updatedUser, updatedPemilikToko] = await this.prisma.$transaction([
        this.prisma.user.update({
          where: { id: userId },
          data: userDataToUpdate,
        }),
        this.prisma.pemilikToko.update({
          where: { id: id },
          data: pemilikTokoDataToUpdate,
        }),
      ]);

      return { ...updatedPemilikToko, user: updatedUser };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new NotFoundException('Email tersebut sudah digunakan.');
        }
      }
      throw error;
    }
  }

  async remove(id: number) {
    await this.findOne(id);

    const data = await this.prisma.$transaction(async (prisma) => {
      const pemilikToko = await prisma.pemilikToko.delete({
        where: { id: id },
      });

      await prisma.user.delete({
        where: { id: pemilikToko.userId },
      });

      return pemilikToko;
    });
  }
}
