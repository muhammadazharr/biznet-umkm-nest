import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCabangDto } from './dto/create-cabang.dto';
import { UpdateCabangDto } from './dto/update-cabang.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { CabangQueryDto } from './dto/cabang-query-dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CabangService {
  constructor(private prismaService: PrismaService) {}

  async create(createCabangDto: CreateCabangDto) {
    const cabang = await this.prismaService.cabangToko.create({
      data: { ...createCabangDto },
    });

    return cabang;
  }

  async findAll(query: CabangQueryDto) {
    const { page, limit, search, tokoId, status } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.CabangTokoWhereInput = {};

    if (search) {
      where.OR = [{ nama_cabang: { contains: search } }];
    }

    if (tokoId) {
      where.tokoId = tokoId;
    }

    if (status) {
      where.status = status;
    }

    const [cabangToko, total] = await this.prismaService.$transaction([
      this.prismaService.cabangToko.findMany({
        where,
        skip,
        take: limit,
        orderBy: { id: 'asc' },
      }),
      this.prismaService.cabangToko.count(),
    ]);

    return {
      data: cabangToko,
      meta: {
        page,
        limit,
        totalData: total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const cabang = await this.prismaService.cabangToko.findUnique({
      where: { id },
    });

    if (!cabang) {
      return new NotFoundException('Cabang toko tidak ditemukan.');
    }

    return cabang;
  }

  async update(id: number, updateCabangDto: UpdateCabangDto) {
    await this.prismaService.cabangToko.update({
      where: { id },
      data: updateCabangDto,
    });
  }

  async remove(id: number) {
    const cabang = await this.findOne(id);

    await this.prismaService.cabangToko.delete({
      where: { id },
    });
  }
}
