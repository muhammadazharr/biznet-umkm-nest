import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProdukDto } from './dto/create-produk.dto';
import { UpdateProdukDto } from './dto/update-produk.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { QueryProdukDto } from './dto/query-produk.dto';
import { Prisma } from '@prisma/client';
import * as fs from 'fs';
import { join } from 'path';

@Injectable()
export class ProdukService {
  constructor(private prismaService: PrismaService) {}

  async create(
    createProdukDto: CreateProdukDto,
    thumbnail: Express.Multer.File,
  ) {
    const { cabangIds, ...data } = createProdukDto;

    if (!cabangIds) {
      throw new Error('cabangIds are required');
    }

    let slug = createProdukDto.nama_produk.toLowerCase().replace(/\s/g, '-');
    let count = 1;
    let foundSlug = await this.prismaService.produk.findUnique({
      where: { slug },
    });

    while (foundSlug) {
      count++;
      const newSlug = `${slug}-${count}`;
      foundSlug = await this.prismaService.produk.findUnique({
        where: { slug: newSlug },
      });

      if (!foundSlug) {
        slug = newSlug;
        break;
      }
    }

    if (thumbnail) {
      const fullPath = thumbnail.path;
      const cleanedPath = fullPath.replace('public/', '');
      data.thumbnail = cleanedPath;
    } else {
      throw new Error('Thumbnail is required');
    }

    const produk = await this.prismaService.produk.create({
      data: {
        ...data,
        slug,
        produkCabangs: {
          createMany: {
            data: cabangIds.map((id) => ({
              cabangId: id,
              status: 'tersedia',
            })),
          },
        },
      },
    });

    return produk;
  }

  async findAll(query: QueryProdukDto) {
    const { page, limit, search, tokoId, cabangIds, kategoriId, status } =
      query;
    const skip = (page - 1) * limit;

    const where: Prisma.ProdukWhereInput = {};

    if (search) {
      where.OR = [{ nama_produk: { contains: search } }];
    }

    if (tokoId) {
      where.tokoId = tokoId;
    }

    if (status) {
      where.status = {
        in: status,
      };
    }

    if (kategoriId) {
      where.kategoriId = kategoriId;
    }

    if (cabangIds && cabangIds.length > 0) {
      where.produkCabangs = {
        some: {
          id: { in: cabangIds },
        },
      };
    }

    const [produk, total] = await this.prismaService.$transaction([
      this.prismaService.produk.findMany({
        where,
        skip,
        include: {
          kategori: true,
          produkCabangs: {
            include: {
              cabang: true,
            },
          },
          toko: true,
        },
        take: limit,
        orderBy: { id: 'asc' },
      }),
      this.prismaService.produk.count(),
    ]);

    return {
      data: produk,
      meta: {
        page,
        limit,
        totalData: total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async landing(query: QueryProdukDto) {
    const { page, limit, search, tokoId, cabangIds, kategoriId } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ProdukWhereInput = {};

    if (search) {
      where.OR = [{ nama_produk: { contains: search } }];
    }

    if (tokoId) {
      where.tokoId = tokoId;
    }

    where.status = 'tampilkan';

    if (kategoriId) {
      where.kategoriId = kategoriId;
    }

    if (cabangIds && cabangIds.length > 0) {
      where.produkCabangs = {
        some: {
          id: { in: cabangIds },
        },
      };
    }

    const [produk, total] = await this.prismaService.$transaction([
      this.prismaService.produk.findMany({
        where,
        skip,
        include: {
          kategori: true,
          produkCabangs: {
            include: {
              cabang: true,
            },
          },
          toko: true,
        },
        take: limit,
        orderBy: { id: 'asc' },
      }),
      this.prismaService.produk.count(),
    ]);

    return {
      data: produk,
      meta: {
        page,
        limit,
        totalData: total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const produk = await this.prismaService.produk.findUnique({
      where: { id },
      include: {
        kategori: true,
        produkCabangs: {
          include: {
            cabang: true,
          },
        },
        toko: true,
      },
    });

    if (!produk) {
      throw new NotFoundException('Produk tidak ditemukan.');
    }

    return produk;
  }

  async landingProfile(slug: string) {
    const produk = await this.prismaService.produk.findUnique({
      where: { slug: slug },
      include: {
        kategori: true,
        produkCabangs: {
          include: {
            cabang: true,
          },
        },
        ulasans: true,
        toko: true,
      },
    });

    if (!produk) {
      throw new NotFoundException('Produk tidak ditemukan.');
    }

    return produk;
  }

  async update(
    id: number,
    UpdateProdukDto: UpdateProdukDto,
    thumbnail: Express.Multer.File,
  ) {
    const produk = await this.findOne(id);

    const { cabangIds, ...data } = UpdateProdukDto;

    let updateData = { ...data };

    if (!data.nama_produk) {
      await this.prismaService.produk.update({
        where: { id },
        data: updateData,
      });
      return;
    }

    let slug = data.nama_produk.toLowerCase().replace(/\s/g, '-');
    let count = 1;
    let foundSlug = await this.prismaService.produk.findUnique({
      where: { slug },
    });

    while (foundSlug && foundSlug.id !== id) {
      count++;
      const newSlug = `${slug}-${count}`;
      foundSlug = await this.prismaService.produk.findUnique({
        where: { slug: newSlug },
      });

      if (!foundSlug) {
        slug = newSlug;
        break;
      }
    }

    if (thumbnail) {
      const fullPath = thumbnail.path;
      const cleanedPath = fullPath.replace('public/', '');
      updateData.thumbnail = cleanedPath;
      const oldPhotoPath = produk.thumbnail;
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

    if (cabangIds !== undefined) {
      const existingCabangs = await this.prismaService.produkCabang.findMany({
        where: { produkId: id },
        select: { cabangId: true },
      });
      const existingCabangIds = existingCabangs.map((pc) => pc.cabangId);

      const toDeleteIds = existingCabangIds.filter(
        (cabangId) => !cabangIds.includes(cabangId),
      );
      const toCreateIds = cabangIds.filter(
        (cabangId) => !existingCabangIds.includes(cabangId),
      );

      if (toDeleteIds.length > 0) {
        await this.prismaService.produkCabang.deleteMany({
          where: {
            produkId: id,
            cabangId: { in: toDeleteIds },
          },
        });
      }

      if (toCreateIds.length > 0) {
        await this.prismaService.produkCabang.createMany({
          data: toCreateIds.map((cabangId) => ({
            produkId: id,
            cabangId: cabangId,
            status: 'tersedia',
          })),
        });
      }
    }

    await this.prismaService.produk.update({
      where: { id },
      data: {
        ...updateData,
        slug,
      },
    });
  }

  async remove(id: number) {
    const produk = await this.findOne(id);

    await this.prismaService.produk.delete({
      where: { id },
    });
  }
}
