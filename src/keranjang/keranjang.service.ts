import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateKeranjangDto } from './dto/create-keranjang.dto';
import { UpdateKeranjangDto } from './dto/update-keranjang.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as crypto from 'crypto';

@Injectable()
export class KeranjangService {
  constructor(private prisma: PrismaService) {}

  async create(createKeranjangDto: CreateKeranjangDto, ipAddress: string, tokenSession: string | undefined) {
    // Generate token if not exists
    if (!tokenSession) {
      tokenSession = crypto.randomUUID();
    }

    // Set expiration to 1 hour from now
    const sessionExpired = new Date();
    sessionExpired.setHours(sessionExpired.getHours() + 1);

    // Get produk to calculate totalHarga
    const produk = await this.prisma.produk.findUnique({
      where: { id: createKeranjangDto.produkId },
    });

    if (!produk) {
      throw new NotFoundException('Produk tidak ditemukan');
    }

    // Check if the item already exists in cart for this token and product
    const existingCartItem = await this.prisma.keranjang.findFirst({
      where: {
        tokenSession,
        produkId: createKeranjangDto.produkId,
        tokoId: createKeranjangDto.tokoId,
      },
    });

    let result;
    if (existingCartItem) {
      // Update quantity and totalHarga
      const newQuantity = existingCartItem.quantiti + createKeranjangDto.quantiti;
      result = await this.prisma.keranjang.update({
        where: { id: existingCartItem.id },
        data: {
          quantiti: newQuantity,
          totalHarga: newQuantity * produk.harga,
          sessionExpired, // Extend expiration time
          ipAdress: ipAddress, // Update IP in case it changed
        },
      });
    } else {
      // Create new cart item
      result = await this.prisma.keranjang.create({
        data: {
          ipAdress: ipAddress,
          tokenSession,
          sessionExpired,
          tokoId: createKeranjangDto.tokoId,
          produkId: createKeranjangDto.produkId,
          quantiti: createKeranjangDto.quantiti,
          totalHarga: createKeranjangDto.quantiti * produk.harga,
        },
      });
    }

    return {
      message: 'Berhasil menambahkan ke keranjang',
      tokenSession,
      data: result,
    };
  }

  async findAll(tokenSession: string) {
    if (!tokenSession) {
      return []; // No token means no cart items
    }

    return this.prisma.keranjang.findMany({
      where: {
        tokenSession,
        sessionExpired: {
          gt: new Date(), // Only get non-expired items
        },
      },
      include: {
        produk: {
          select: {
            nama_produk: true,
            harga: true,
            thumbnail: true,
            slug: true,
          }
        },
        toko: {
          select: {
            nama_toko: true,
            slug: true,
            nomor_hp: true,
          }
        }
      }
    });
  }

  async update(id: number, updateKeranjangDto: UpdateKeranjangDto, tokenSession: string) {
    const existing = await this.prisma.keranjang.findFirst({
      where: { id, tokenSession },
      include: { produk: true }
    });

    if (!existing) {
      throw new NotFoundException('Item keranjang tidak ditemukan atau token tidak valid');
    }

    let dataToUpdate: any = {};
    if (updateKeranjangDto.quantiti) {
      dataToUpdate.quantiti = updateKeranjangDto.quantiti;
      dataToUpdate.totalHarga = updateKeranjangDto.quantiti * existing.produk.harga;
    }
    
    // Extend session expiration on update
    const sessionExpired = new Date();
    sessionExpired.setHours(sessionExpired.getHours() + 1);
    dataToUpdate.sessionExpired = sessionExpired;

    return this.prisma.keranjang.update({
      where: { id },
      data: dataToUpdate,
    });
  }

  async remove(id: number, tokenSession: string) {
    const existing = await this.prisma.keranjang.findFirst({
      where: { id, tokenSession },
    });

    if (!existing) {
      throw new NotFoundException('Item keranjang tidak ditemukan atau token tidak valid');
    }

    return this.prisma.keranjang.delete({
      where: { id },
    });
  }

  // Cron Job running every 10 minutes to clean up expired carts
  @Cron(CronExpression.EVERY_10_MINUTES)
  async handleCron() {
    console.log('Running Cron Job: Deleting expired carts...');
    try {
      const result = await this.prisma.keranjang.deleteMany({
        where: {
          sessionExpired: {
            lt: new Date(),
          },
        },
      });
      if (result.count > 0) {
        console.log(`Deleted ${result.count} expired cart items.`);
      }
    } catch (error) {
      console.error('Error deleting expired carts:', error);
    }
  }
}
