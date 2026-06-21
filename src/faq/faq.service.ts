import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { QueryFaqDto } from './dto/query-faq.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class FaqService {
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

  async create(createFaqDto: CreateFaqDto, user?: any) {
    const clientTokoId = await this.getTokoIdForUser(user);
    if (clientTokoId !== null) {
      createFaqDto.tokoId = clientTokoId;
    }
    const faq = await this.prismaService.faq.create({
      data: { ...createFaqDto },
    });

    return faq;
  }

  async landing(query: QueryFaqDto) {
    const { tokoId } = query;

    const where: Prisma.FaqWhereInput = {};

    if (tokoId) {
      where.tokoId = tokoId;
    }

    const [faq, total] = await this.prismaService.$transaction([
      this.prismaService.faq.findMany({
        where,
        include: {
          toko: true,
        },
        orderBy: { id: 'asc' },
      }),
      this.prismaService.faq.count({ where }),
    ]);

    return faq;
  }

  async findAll(query: QueryFaqDto, user?: any) {
    const { page, limit, search, tokoId } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.FaqWhereInput = {};

    const clientTokoId = await this.getTokoIdForUser(user);
    if (clientTokoId !== null) {
      where.tokoId = clientTokoId;
    } else if (tokoId) {
      where.tokoId = tokoId;
    }

    if (search) {
      where.OR = [{ pertanyaan: { contains: search } }];
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
      this.prismaService.faq.count({ where }),
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

  async findOne(id: number, user?: any) {
    const faq = await this.prismaService.faq.findUnique({
      include: {
        toko: true,
      },
      where: { id },
    });

    if (!faq) {
      throw new NotFoundException('Faq tidak ditemukan.');
    }

    const clientTokoId = await this.getTokoIdForUser(user);
    if (clientTokoId !== null && faq.tokoId !== clientTokoId) {
      throw new ForbiddenException('Anda tidak memiliki akses ke FAQ ini.');
    }

    return faq;
  }

  async update(id: number, updateFaqDto: UpdateFaqDto, user?: any) {
    await this.findOne(id, user);

    const clientTokoId = await this.getTokoIdForUser(user);
    if (clientTokoId !== null) {
      updateFaqDto.tokoId = clientTokoId;
    }

    await this.prismaService.faq.update({
      where: { id },
      data: updateFaqDto,
    });
  }

  async remove(id: number, user?: any) {
    await this.findOne(id, user);

    await this.prismaService.faq.delete({
      where: { id },
    });
  }
}
