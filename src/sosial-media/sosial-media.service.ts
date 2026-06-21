import {
  ConflictException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateSosialMediaDto } from './dto/create-sosial-media.dto';
import { UpdateSosialMediaDto } from './dto/update-sosial-media.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { SosialMediaQueryDto } from './dto/query-sosial-media.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class SosialMediaService {
  constructor(private prismaService: PrismaService) {}

  private async getTokoIdForUser(user: any): Promise<number | null> {
    if (user && user.roles && !Array.isArray(user.roles) && user.roles.name === 'client') {
      const pemilikToko = await this.prismaService.pemilikToko.findUnique({
        where: { userId: user.id },
      });
      if (!pemilikToko) {
        throw new ForbiddenException('Toko Anda tidak ditemukan atau Anda bukan pemilik toko.');
      }
      return pemilikToko.tokoId;
    }
    return null;
  }

  async create(createSosialMediaDto: CreateSosialMediaDto, user?: any) {
    const clientTokoId = await this.getTokoIdForUser(user);
    if (clientTokoId !== null) {
      createSosialMediaDto.tokoId = clientTokoId;
    }
    const cabang = await this.prismaService.sosialMedia.create({
      data: { ...createSosialMediaDto },
    });

    return cabang;
  }

  async findAll(query: SosialMediaQueryDto, user?: any) {
    const { page, limit, search, tokoId } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.SosialMediaWhereInput = {};

    const clientTokoId = await this.getTokoIdForUser(user);
    if (clientTokoId !== null) {
      where.tokoId = clientTokoId;
    } else if (tokoId) {
      where.tokoId = tokoId;
    }

    if (search) {
      where.nama = {
        contains: search,
      };
    }

    const [sosials, total] = await this.prismaService.$transaction([
      this.prismaService.sosialMedia.findMany({
        where,
        include: {
          toko: true,
        },
        skip,
        take: limit,
      }),

      this.prismaService.sosialMedia.count({ where }),
    ]);

    return {
      data: sosials,
      meta: {
        page,
        limit,
        totalData: total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async landing(query: SosialMediaQueryDto) {
    const { tokoId } = query;

    const where: Prisma.SosialMediaWhereInput = {};

    if (tokoId) {
      where.tokoId = tokoId;
    }

    const sosials = await this.prismaService.sosialMedia.findMany({
      where,
      include: {
        toko: true,
      },
    });

    return sosials;
  }

  async findOne(id: number, user?: any) {
    const data = await this.prismaService.sosialMedia.findUnique({
      where: { id: id },
    });

    if (!data) {
      throw new NotFoundException('Data SosialMedia tidak ditemukan.');
    }

    const clientTokoId = await this.getTokoIdForUser(user);
    if (clientTokoId !== null && data.tokoId !== clientTokoId) {
      throw new ForbiddenException('Anda tidak memiliki akses ke Sosial Media ini.');
    }

    return data;
  }

  async update(id: number, updateSosialMediaDto: UpdateSosialMediaDto, user?: any) {
    await this.findOne(id, user);

    const clientTokoId = await this.getTokoIdForUser(user);
    if (clientTokoId !== null) {
      updateSosialMediaDto.tokoId = clientTokoId;
    }

    return this.prismaService.sosialMedia.update({
      where: { id },
      data: { ...updateSosialMediaDto },
    });
  }

  async remove(id: number, user?: any) {
    await this.findOne(id, user);
    return await this.prismaService.sosialMedia.delete({
      where: { id },
    });
  }
}
