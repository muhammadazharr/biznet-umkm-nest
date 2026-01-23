import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateKategoriDto } from './dto/create-kategori.dto';
import { UpdateKategoriDto } from './dto/update-kategori.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { KategoriQueryDto } from './dto/kategori-query.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class KategoriService {
  constructor(private prismaService: PrismaService) {}

  async create(createKategoriDto: CreateKategoriDto) {
    const kategori = await this.prismaService.kategori.create({
      data: { ...createKategoriDto },
    });

    return kategori;
  }

  async findAll(query: KategoriQueryDto) {
    const { page, limit, search, tipe } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.KategoriWhereInput = {};

    if (search) {
      where.OR = [{ nama_kategori: { contains: search } }];
    }

    if (tipe && tipe.length > 0) {
      where.tipe = {
        in: tipe,
      };
    }

    const [kategori, total] = await this.prismaService.$transaction([
      this.prismaService.kategori.findMany({
        where,
        skip,
        take: limit,
        orderBy: { id: 'asc' },
      }),
      this.prismaService.kategori.count(),
    ]);

    return {
      data: kategori,
      meta: {
        page,
        limit,
        totalData: total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async landing(query: KategoriQueryDto) {
    const { search } = query;
    const limit = 100;
    const where: Prisma.KategoriWhereInput = {};

    if (search) {
      where.OR = [{ nama_kategori: { contains: search } }];
    }

    where.tipe = 'produk';

    const [kategori, total] = await this.prismaService.$transaction([
      this.prismaService.kategori.findMany({
        where,
        take: limit,
        orderBy: { id: 'asc' },
      }),
      this.prismaService.kategori.count(),
    ]);

    return kategori;
  }

  async landingShow(id: number) {
    const kategori = await this.prismaService.kategori.findUnique({
      where: { id },
    });

    if (!kategori) {
      throw new NotFoundException('Kategori tidak ditemukan.');
    }

    return kategori;
  }

  async findOne(id: number) {
    const kategori = await this.prismaService.kategori.findUnique({
      where: { id },
    });

    if (!kategori) {
      throw new NotFoundException('Kategori tidak ditemukan.');
    }

    return kategori;
  }

  async update(id: number, updateKategoriDto: UpdateKategoriDto) {
    await this.prismaService.kategori.update({
      where: { id },
      data: updateKategoriDto,
    });
  }

  async remove(id: number) {
    const kategori = await this.findOne(id);

    await this.prismaService.kategori.delete({
      where: { id },
    });
  }
}
