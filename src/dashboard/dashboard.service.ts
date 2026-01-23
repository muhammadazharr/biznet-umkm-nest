import { PemilikToko } from './../pemilik-toko/entities/pemilik-toko.entity';
import { Injectable } from '@nestjs/common';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prismaService: PrismaService) {}
  async dashboardAdmin() {
    const totalProduk = await this.prismaService.produk.count();
    const totalToko = await this.prismaService.toko.count();
    const totalUlasan = await this.prismaService.ulasan.count();
    const totalPendaftar = await this.prismaService.pendaftar.count();

    return {
      totalProduk,
      totalToko,
      totalUlasan,
      totalPendaftar,
    };
  }

  async dashboardClient(user: any) {
    const userFull = await this.prismaService.user.findUnique({
      where: {
        id: user.id,
      },
      include: {
        pemilikToko: {
          include: { toko: true },
        },
      },
    });
    const tokoId = userFull?.pemilikToko?.tokoId;

    if (!tokoId) {
      console.error(
        'ERROR: Toko ID tidak ditemukan pada user yang terautentikasi.',
        user,
      );
      return {
        totalProduk: 0,
        totalCabang: 0,
        totalUlasan: 0,
        totalPengguna: 0,
      };
    }

    try {
      const [totalProduk, totalCabang, totalUlasan, totalPengguna] =
        await this.prismaService.$transaction([
          this.prismaService.produk.count({
            where: {
              tokoId: tokoId,
            },
          }),

          this.prismaService.cabangToko.count({
            where: {
              tokoId: tokoId,
            },
          }),

          this.prismaService.ulasan.count({
            where: {
              produk: {
                tokoId: tokoId, // Filter Ulasan yang produknya dimiliki oleh tokoId ini
              },
            },
          }),

          this.prismaService.pemilikToko.count({
            where: {
              tokoId: tokoId,
              // Opsional: Filter jika Anda hanya ingin menghitung karyawan, bukan pemilik utama
              // role: { name: 'client_employee' }
            },
          }),
        ]);

      return {
        totalProduk,
        totalCabang,
        totalUlasan,
        totalPengguna,
      };
    } catch (error) {
      console.error('Error during dashboard transaction:', error);
      throw new Error('Gagal mengambil data dashboard client.');
    }
  }
}
