import { PrismaService } from './../prisma/prisma.service';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTokoDto } from './dto/create-toko.dto';
import { UpdateTokoDto } from './dto/update-toko.dto';
import { TokoQueryDto } from './dto/toko-query.dto';
import { Prisma } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { UpdateTokoClientDto } from './dto/update-toko-client.dto';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import { join } from 'path';

@Injectable()
export class TokoService {
  constructor(
    private prismaService: PrismaService,
    private configService: ConfigService,
  ) {}
  async create(createTokoDto: CreateTokoDto) {
    const { email } = createTokoDto;

    const existingUser = await this.prismaService.user.findFirst({
      where: { email: email },
    });

    if (existingUser) {
      throw new ConflictException('Email sudah terdaftar');
    }

    let slug = createTokoDto.nama_toko.toLowerCase().replace(/\s/g, '-');
    let count = 1;
    let foundSlug = await this.prismaService.toko.findUnique({
      where: { slug },
    });

    while (foundSlug) {
      count++;
      const newSlug = `${slug}-${count}`;
      foundSlug = await this.prismaService.toko.findUnique({
        where: { slug: newSlug },
      });

      if (!foundSlug) {
        slug = newSlug;
        break;
      }
    }

    const defaultPassword =
      this.configService.get<string>('PASSWORD_DEFAULT') || '12345678';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const data = await this.prismaService.$transaction(async (prisma) => {
      const user = await prisma.user.create({
        data: {
          email: createTokoDto.email,
          username: createTokoDto.nama_pemilik,
          password: hashedPassword,
        },
      });

      const role = await prisma.role.findUnique({
        where: { name: 'client' },
      });

      if (!role) {
        throw new ConflictException('Role Pemilik Toko tidak ditemukan');
      }

      const userRole = await prisma.userRole.create({
        data: {
          userId: user.id,
          roleId: role.id,
        },
      });

      const toko = await prisma.toko.create({
        data: {
          nama_toko: createTokoDto.nama_toko,
          nib: createTokoDto.nib,
          slug: slug,
          PemilikToko: {
            create: {
              nama: createTokoDto.nama_pemilik,
              jabatan: 'Owner',
              userId: user.id,
            },
          },
        },
      });

      const cabangToko = await prisma.cabangToko.create({
        data: {
          tokoId: toko.id,
          nama_cabang: createTokoDto.nama_toko,
          tipe: 'primer',
          status: 'aktif',
        },
      });

      return toko;
    });

    return data;
  }

  async findAll(query: TokoQueryDto) {
    const { page, limit, search, status } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.TokoWhereInput = {};

    if (search) {
      where.OR = [
        { nama_toko: { contains: search } },
        { nib: { contains: search } },
      ];
    }

    if (status && status.length > 0) {
      where.status = {
        in: status,
      };
    }

    const [data, total] = await this.prismaService.$transaction([
      this.prismaService.toko.findMany({
        where,
        skip,
        take: limit,
        include: {
          PemilikToko: {
            include: { user: true },
          },
        },
      }),

      this.prismaService.toko.count({ where }),
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

  async landing(query: TokoQueryDto) {
    const { page, limit, search } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.TokoWhereInput = {};

    if (search) {
      where.OR = [
        { nama_toko: { contains: search } },
        { nib: { contains: search } },
      ];
    }

    where.status = 'aktif';

    const [data, total] = await this.prismaService.$transaction([
      this.prismaService.toko.findMany({
        skip,
        take: limit,
        where,
        include: {
          PemilikToko: true,
          CabangToko: true,
          KategoriToko: {
            include: { kategori: true },
          },
        },
        orderBy: [
          {
            rating: 'desc',
          },
          {
            id: 'desc',
          },
        ],
      }),

      this.prismaService.toko.count({ where }),
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

  async findTokoClient(id: number) {
    const data = await this.prismaService.toko.findFirst({
      where: { id: id },
      include: {
        PemilikToko: {
          include: { user: true },
        },
        CabangToko: true,
        KategoriToko: {
          include: { kategori: true },
        },
      },
    });

    if (!data) {
      throw new NotFoundException('Data toko tidak ditemukan.');
    }

    return data;
  }

  async landingProfile(slug: string) {
    const data = await this.prismaService.toko.findFirst({
      where: { slug: slug },
      include: {
        PemilikToko: {
          include: { user: true },
        },
        CabangToko: true,
        KategoriToko: {
          include: { kategori: true },
        },
      },
    });

    if (!data) {
      throw new NotFoundException('Data toko tidak ditemukan.');
    }

    return data;
  }

  async findOne(id: number) {
    const data = await this.prismaService.toko.findFirst({
      where: { id: id },
      include: {
        PemilikToko: {
          include: { user: true },
        },
        CabangToko: true,
      },
    });

    if (!data) {
      throw new NotFoundException('Data toko tidak ditemukan.');
    }

    return data;
  }

  async update(id: number, updateTokoDto: UpdateTokoDto) {
    const { nama_toko } = updateTokoDto;

    let slug = nama_toko.toLowerCase().replace(/\s/g, '-');
    let count = 1;
    let foundSlug = await this.prismaService.toko.findUnique({
      where: { slug },
    });

    while (foundSlug && foundSlug.id !== id) {
      count++;
      const newSlug = `${slug}-${count}`;
      foundSlug = await this.prismaService.toko.findUnique({
        where: { slug: newSlug },
      });

      if (!foundSlug) {
        slug = newSlug;
        break;
      }
    }

    return await this.prismaService.toko.update({
      where: { id: id },
      data: { ...updateTokoDto, slug },
    });
  }

  async updateClient(
    id: number,
    updateClientDto: UpdateTokoClientDto,
    logo?: Express.Multer.File,
  ) {
    const { kategori_id, ...rest } = updateClientDto;

    const toko = await this.findOne(id);

    if (kategori_id) {
      await this.prismaService.kategoriToko.deleteMany({
        where: { tokoId: id },
      });

      const kategoriTokoData = kategori_id.map((kategoriId: any) => ({
        tokoId: id,
        kategoriId: parseInt(kategoriId, 10),
      }));

      await this.prismaService.kategoriToko.createMany({
        data: kategoriTokoData,
      });
    }

    if (logo) {
      const fullPath = logo.path;
      const cleanedPath = fullPath.replace('public/', '');
      rest.logo = cleanedPath;
      const oldPhotoPath = toko.logo;
      if (
        oldPhotoPath &&
        fs.existsSync(join(process.cwd(), 'public', oldPhotoPath))
      ) {
        try {
          fs.unlinkSync(join(process.cwd(), 'public', oldPhotoPath));
          console.log(`Successfully deleted old photo: ${oldPhotoPath}`);
        } catch (err) {
          console.error(`Failed to delete old photo: ${oldPhotoPath}`, err);
        }
      }
    }

    return await this.prismaService.toko.update({
      where: { id: id },
      data: rest,
    });
  }

  async remove(id: number) {
    const data = await this.findOne(id);
    return await this.prismaService.$transaction([
      this.prismaService.toko.delete({
        where: { id: id },
      }),
      this.prismaService.cabangToko.deleteMany({
        where: { tokoId: id },
      }),
      this.prismaService.pemilikToko.deleteMany({
        where: { tokoId: id },
      }),
      this.prismaService.user.deleteMany({
        where: {
          id: {
            in: data.PemilikToko.map((pemilikToko) => pemilikToko.userId),
          },
        },
      }),
    ]);
  }
}
