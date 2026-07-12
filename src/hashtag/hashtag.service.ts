import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateHashtagDto } from './dto/create-hashtag.dto';
import { UpdateHashtagDto } from './dto/update-hashtag.dto';
import { QueryHashtagDto } from './dto/query-hashtag.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class HashtagService {
  constructor(private prismaService: PrismaService) {}

  async create(createHashtagDto: CreateHashtagDto) {
    const existing = await this.prismaService.hashtag.findUnique({
      where: {
        nama_tokoId: {
          nama: createHashtagDto.nama,
          tokoId: createHashtagDto.tokoId,
        },
      },
    });

    if (existing) {
      throw new BadRequestException('Hashtag dengan nama tersebut sudah terdaftar di toko ini.');
    }

    return this.prismaService.hashtag.create({
      data: createHashtagDto,
    });
  }

  async findAll(query: QueryHashtagDto) {
    const { page, limit, search, tokoId } = query;
    const skip = page && limit ? (page - 1) * limit : undefined;
    const take = limit ? limit : undefined;

    const where: Prisma.HashtagWhereInput = {};

    if (search) {
      where.nama = { contains: search };
    }

    if (tokoId) {
      where.tokoId = tokoId;
    }

    const [hashtags, total] = await this.prismaService.$transaction([
      this.prismaService.hashtag.findMany({
        where,
        skip,
        take,
        orderBy: { nama: 'asc' },
      }),
      this.prismaService.hashtag.count({ where }),
    ]);

    return {
      data: hashtags,
      meta: {
        page: page || 1,
        limit: limit || total,
        totalData: total,
        totalPages: limit ? Math.ceil(total / limit) : 1,
      },
    };
  }

  async findOne(id: number) {
    const hashtag = await this.prismaService.hashtag.findUnique({
      where: { id },
    });

    if (!hashtag) {
      throw new NotFoundException('Hashtag tidak ditemukan.');
    }

    return hashtag;
  }

  async update(id: number, updateHashtagDto: UpdateHashtagDto) {
    if (updateHashtagDto.nama) {
      const current = await this.findOne(id);
      const existing = await this.prismaService.hashtag.findUnique({
        where: {
          nama_tokoId: {
            nama: updateHashtagDto.nama,
            tokoId: updateHashtagDto.tokoId || current.tokoId,
          },
        },
      });

      if (existing && existing.id !== id) {
        throw new BadRequestException('Hashtag dengan nama tersebut sudah terdaftar di toko ini.');
      }
    }

    return this.prismaService.hashtag.update({
      where: { id },
      data: updateHashtagDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prismaService.hashtag.delete({
      where: { id },
    });
  }
}
