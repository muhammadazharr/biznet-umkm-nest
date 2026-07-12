import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateCabangDto } from './dto/create-cabang.dto';
import { UpdateCabangDto } from './dto/update-cabang.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { CabangQueryDto } from './dto/cabang-query-dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CabangService {
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

  async create(createCabangDto: CreateCabangDto, user?: any) {
    const clientTokoId = await this.getTokoIdForUser(user);
    if (clientTokoId !== null) {
      createCabangDto.tokoId = clientTokoId;
    }
    const cabang = await this.prismaService.cabangToko.create({
      data: { ...createCabangDto },
    });

    return cabang;
  }

  async findAll(query: CabangQueryDto, user?: any) {
    const { page, limit, search, tokoId, status } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.CabangTokoWhereInput = {};

    const clientTokoId = await this.getTokoIdForUser(user);
    if (clientTokoId !== null) {
      where.tokoId = clientTokoId;
    } else if (tokoId) {
      where.tokoId = tokoId;
    }

    if (search) {
      where.OR = [{ nama_cabang: { contains: search } }];
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
      this.prismaService.cabangToko.count({ where }),
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

  async findOne(id: number, user?: any) {
    const cabang = await this.prismaService.cabangToko.findUnique({
      where: { id },
    });

    if (!cabang) {
      throw new NotFoundException('Cabang toko tidak ditemukan.');
    }

    const clientTokoId = await this.getTokoIdForUser(user);
    if (clientTokoId !== null && cabang.tokoId !== clientTokoId) {
      throw new ForbiddenException('Anda tidak memiliki akses ke cabang ini.');
    }

    return cabang;
  }

  async update(id: number, updateCabangDto: UpdateCabangDto, user?: any) {
    await this.findOne(id, user);

    const clientTokoId = await this.getTokoIdForUser(user);
    if (clientTokoId !== null) {
      updateCabangDto.tokoId = clientTokoId;
    }

    await this.prismaService.cabangToko.update({
      where: { id },
      data: updateCabangDto,
    });
  }

  async remove(id: number, user?: any) {
    await this.findOne(id, user);

    await this.prismaService.cabangToko.delete({
      where: { id },
    });
  }
}

