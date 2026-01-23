import { Prisma } from '@prisma/client';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUlasanDto } from './dto/create-ulasan.dto';
import { UpdateUlasanDto } from './dto/update-ulasan.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { QueryUlasanDto } from './dto/query-ulasan.dto';

@Injectable()
export class UlasanService {
  constructor(private prismaService: PrismaService) {}
  async create(createUlasanDto: CreateUlasanDto) {
    const ulasan = await this.prismaService.ulasan.create({
      data: { ...createUlasanDto },
    });

    return ulasan;
  }

  async findAll(query: QueryUlasanDto) {
    const { page, limit, search, produkId, tokoId } = query; // Destructure semua properti
    const skip = (page - 1) * limit;

    const where: Prisma.UlasanWhereInput = {};

    if (search) {
      where.nama = {
        contains: search,
      };
    }

    if (produkId) {
      where.produkId = produkId;
    }

    if (tokoId) {
      where.produk = {
        tokoId,
      };
    }

    const [ulasan, total] = await this.prismaService.$transaction([
      this.prismaService.ulasan.findMany({
        where,
        skip,
        orderBy: { createdAt: 'desc' },
        include: {
          produk: true,
        },
        take: limit,
      }),

      this.prismaService.ulasan.count({ where }),
    ]);

    return {
      data: ulasan,
      meta: {
        page,
        limit,
        totalData: total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async landing(query: QueryUlasanDto) {
    const { page, limit, search, produkId, tokoId } = query; // Destructure semua properti
    const skip = (page - 1) * limit;

    const where: Prisma.UlasanWhereInput = {};

    if (search) {
      where.nama = {
        contains: search,
      };
    }

    if (tokoId) {
      where.produk = {
        tokoId,
      };
    }

    where.produkId = produkId;
    where.status = 'terima';

    const [ulasan, total] = await this.prismaService.$transaction([
      this.prismaService.ulasan.findMany({
        where,
        skip,
        orderBy: { createdAt: 'desc' },
        include: {
          produk: {
            include: { toko: true },
          },
        },
        take: limit,
      }),

      this.prismaService.ulasan.count({ where }),
    ]);

    return {
      data: ulasan,
      meta: {
        page,
        limit,
        totalData: total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const data = await this.prismaService.ulasan.findUnique({
      where: { id: id },
      include: {
        produk: true,
      },
    });

    if (!data) {
      throw new NotFoundException('Data ulasan tidak ditemukan.');
    }
    return data;
  }

  async update(id: number, updateUlasanDto: UpdateUlasanDto) {
    const ulasanExisting = await this.findOne(id);
    await this.prismaService.ulasan.update({
      where: { id },
      data: { ...updateUlasanDto },
    });

    if (updateUlasanDto.status === 'terima') {
      const tokoId = ulasanExisting.produk.tokoId;

      const aggregasi = await this.prismaService.ulasan.aggregate({
        _avg: {
          nilai: true,
        },
        where: {
          status: 'terima',
          produk: {
            tokoId: tokoId,
          },
        },
      });

      const ratingBaru = aggregasi._avg.nilai || 0;

      await this.prismaService.toko.update({
        where: { id: tokoId },
        data: {
          rating: Math.round((aggregasi._avg.nilai || 0) * 10) / 10,
        },
      });
    }
  }

  async remove(id: number) {
    const data = await this.findOne(id);

    await this.prismaService.ulasan.delete({
      where: { id },
    });
  }
}
