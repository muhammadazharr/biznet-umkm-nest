import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSosialMediaDto } from './dto/create-sosial-media.dto';
import { UpdateSosialMediaDto } from './dto/update-sosial-media.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { SosialMediaQueryDto } from './dto/query-sosial-media.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class SosialMediaService {
  constructor(private prismaService: PrismaService) {}
  async create(createSosialMediaDto: CreateSosialMediaDto) {
    const cabang = await this.prismaService.sosialMedia.create({
      data: { ...createSosialMediaDto },
    });

    return cabang;
  }

  async findAll(query: SosialMediaQueryDto) {
    const { page, limit, search, tokoId } = query; // Destructure semua properti
    const skip = (page - 1) * limit;

    const where: Prisma.SosialMediaWhereInput = {};

    if (search) {
      where.nama = {
        contains: search,
      };
    }

    if (tokoId) {
      where.tokoId = tokoId;
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

  async findOne(id: number) {
    const data = await this.prismaService.sosialMedia.findUnique({
      where: { id: id },
    });

    if (!data) {
      throw new NotFoundException('Data SosialMedia tidak ditemukan.');
    }
    return data;
  }

  async update(id: number, updateSosialMediaDto: UpdateSosialMediaDto) {
    return this.prismaService.sosialMedia.update({
      where: { id },
      data: { ...updateSosialMediaDto },
    });
  }

  async remove(id: number) {
    const data = await this.findOne(id);
    return await this.prismaService.sosialMedia.delete({
      where: { id },
    });
  }
}
