import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
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

  private async validateClientCabang(clientTokoId: number, cabangData: any[]) {
    const ownedCabangs = await this.prismaService.cabangToko.findMany({
      where: { tokoId: clientTokoId },
      select: { id: true },
    });
    const ownedCabangIds = ownedCabangs.map((c) => c.id);
    for (const item of cabangData) {
      if (!ownedCabangIds.includes(item.cabangId)) {
        throw new ForbiddenException('Cabang tidak valid untuk toko Anda.');
      }
    }
  }

  async create(
    createProdukDto: CreateProdukDto,
    thumbnail: Express.Multer.File,
    user?: any,
  ) {
    const { cabangData, hashtagIds, ...data } = createProdukDto;

    if (!cabangData) {
      throw new Error('cabangData is required');
    }

    const clientTokoId = await this.getTokoIdForUser(user);
    if (clientTokoId !== null) {
      createProdukDto.tokoId = clientTokoId;
      data.tokoId = clientTokoId;
      await this.validateClientCabang(clientTokoId, cabangData);
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
            data: cabangData.map((item) => ({
              cabangId: item.cabangId,
              status: item.status,
            })),
          },
        },
        hashtags: hashtagIds && hashtagIds.length > 0 ? {
          createMany: {
            data: hashtagIds.map((id) => ({
              hashtagId: id,
            })),
          },
        } : undefined,
      },
    });

    return produk;
  }

  async findAll(query: QueryProdukDto, user?: any) {
    const { page, limit, search, tokoId, cabangIds, kategoriId, status } =
      query;
    const skip = (page - 1) * limit;

    const where: Prisma.ProdukWhereInput = {};

    const clientTokoId = await this.getTokoIdForUser(user);
    if (clientTokoId !== null) {
      where.tokoId = clientTokoId;
    } else if (tokoId) {
      where.tokoId = tokoId;
    }

    if (search) {
      where.OR = [
        { nama_produk: { contains: search } },
        { hashtags: { some: { hashtag: { nama: { contains: search } } } } }
      ];
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
          hashtags: {
            include: {
              hashtag: true,
            },
          },
          _count: {
            select: {
              ulasans: true, // Nama relasi ulasan di schema.prisma Anda
            },
          },
        },
        take: limit,
        orderBy: { id: 'asc' },
      }),
      this.prismaService.produk.count({ where }),
    ]);

    const formattedData = produk.map((item) => {
      const { _count, ...rest } = item;
      return {
        ...rest,
        totalUlasan: _count.ulasans,
      };
    });

    return {
      data: formattedData,
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
      where.OR = [
        { nama_produk: { contains: search } },
        { hashtags: { some: { hashtag: { nama: { contains: search } } } } }
      ];
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
          hashtags: {
            include: {
              hashtag: true,
            },
          },
          _count: {
            select: {
              ulasans: true,
            },
          },
        },
        take: limit,
        orderBy: [
          {
            ulasans: {
              _count: 'desc',
            },
          },
          {
            id: 'desc',
          },
        ],
      }),
      this.prismaService.produk.count({ where }),
    ]);

    const formattedData = produk.map((item) => {
      const { _count, ...rest } = item;
      return {
        ...rest,
        totalUlasan: _count?.ulasans || 0,
      };
    });

    return {
      data: formattedData,
      meta: {
        page,
        limit,
        totalData: total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number, user?: any) {
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
        hashtags: {
          include: {
            hashtag: true,
          },
        },
      },
    });

    if (!produk) {
      throw new NotFoundException('Produk tidak ditemukan.');
    }

    const clientTokoId = await this.getTokoIdForUser(user);
    if (clientTokoId !== null && produk.tokoId !== clientTokoId) {
      throw new ForbiddenException('Anda tidak memiliki akses ke produk ini.');
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
        hashtags: {
          include: {
            hashtag: true,
          },
        },
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
    user?: any,
  ) {
    const produk = await this.findOne(id, user);

    const { cabangData, hashtagIds, ...data } = UpdateProdukDto;

    let updateData = { ...data };

    const clientTokoId = await this.getTokoIdForUser(user);
    if (clientTokoId !== null) {
      UpdateProdukDto.tokoId = clientTokoId;
      updateData.tokoId = clientTokoId;
      if (cabangData !== undefined) {
        await this.validateClientCabang(clientTokoId, cabangData);
      }
    }

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
    } else {
      if (produk.thumbnail) {
        updateData.thumbnail = produk.thumbnail;
      }
    }

    if (cabangData !== undefined) {
      const existingCabangs = await this.prismaService.produkCabang.findMany({
        where: { produkId: id },
      });
      const incomingCabangIds = cabangData.map((cd) => cd.cabangId);

      const toDeleteIds = existingCabangs
        .map((pc) => pc.cabangId)
        .filter((cabangId) => !incomingCabangIds.includes(cabangId));

      if (toDeleteIds.length > 0) {
        await this.prismaService.produkCabang.deleteMany({
          where: {
            produkId: id,
            cabangId: { in: toDeleteIds },
          },
        });
      }

      for (const item of cabangData) {
        const existing = existingCabangs.find((pc) => pc.cabangId === item.cabangId);
        if (existing) {
          if (existing.status !== item.status) {
            await this.prismaService.produkCabang.update({
              where: { id: existing.id },
              data: { status: item.status },
            });
          }
        } else {
          await this.prismaService.produkCabang.create({
            data: {
              produkId: id,
              cabangId: item.cabangId,
              status: item.status,
            },
          });
        }
      }
    }

    if (hashtagIds !== undefined) {
      const existingHashtags = await this.prismaService.produkHashtag.findMany({
        where: { produkId: id },
        select: { hashtagId: true },
      });
      const existingHashtagIds = existingHashtags.map((ph) => ph.hashtagId);

      const toDeleteIds = existingHashtagIds.filter(
        (hashtagId) => !hashtagIds.includes(hashtagId),
      );
      const toCreateIds = hashtagIds.filter(
        (hashtagId) => !existingHashtagIds.includes(hashtagId),
      );

      if (toDeleteIds.length > 0) {
        await this.prismaService.produkHashtag.deleteMany({
          where: {
            produkId: id,
            hashtagId: { in: toDeleteIds },
          },
        });
      }

      if (toCreateIds.length > 0) {
        await this.prismaService.produkHashtag.createMany({
          data: toCreateIds.map((hashtagId) => ({
            produkId: id,
            hashtagId: hashtagId,
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

  async remove(id: number, user?: any) {
    await this.findOne(id, user);

    await this.prismaService.produk.delete({
      where: { id },
    });
  }
}
