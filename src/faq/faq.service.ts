import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { QueryFaqDto } from './dto/query-faq.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class FaqService {
  constructor(private prismaService: PrismaService) {}

  async create(createFaqDto: CreateFaqDto) {
    const faq = await this.prismaService.faq.create({
      data: { ...createFaqDto },
    });

    return faq;
  }

  async findAll(query: QueryFaqDto) {
    const { page, limit, search, tokoId } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.FaqWhereInput = {};

    if (search) {
      where.OR = [{ pertanyaan: { contains: search } }];
    }

    if (tokoId) {
      where.tokoId = tokoId;
    }

    const [faq, total] = await this.prismaService.$transaction([
      this.prismaService.faq.findMany({
        where,
        include: {
          toko: true,
        },
        skip,
        take: limit,
        orderBy: { id: 'asc' },
      }),
      this.prismaService.faq.count(),
    ]);

    return {
      data: faq,
      meta: {
        page,
        limit,
        totalData: total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const faq = await this.prismaService.faq.findUnique({
      include: {
        toko: true,
      },
      where: { id },
    });

    if (!faq) {
      return new NotFoundException('Faq tidak ditemukan.');
    }

    return faq;
  }

  async update(id: number, updateFaqDto: UpdateFaqDto) {
    await this.prismaService.faq.update({
      where: { id },
      data: updateFaqDto,
    });
  }

  async remove(id: number) {
    const data = await this.findOne(id);

    await this.prismaService.faq.delete({
      where: { id },
    });
  }
}
