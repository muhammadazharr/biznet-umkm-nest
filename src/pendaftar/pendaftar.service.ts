import { ConflictException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreatePendaftarDto } from './dto/create-pendaftar.dto';
import { UpdatePendaftarDto } from './dto/update-pendaftar.dto';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@/prisma/prisma.service';
import { EmailService } from '@/email/email.service';
import { PendaftarQueryDto } from './dto/query-pendaftar.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class PendaftarService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}
  async create(createPendaftarDto: CreatePendaftarDto) {
    const { email, nama_pemilik } = createPendaftarDto;

    const existingUser = await this.prisma.user.findFirst({
      where: {
        email: email,
      },
    });

    const existingPendaftar = await this.prisma.pendaftar.findFirst({
      where: {
        email: email,
      },
    });

    if (existingUser || existingPendaftar) {
      throw new ConflictException('Email atau username sudah terdaftar.');
    }

    await this.prisma.pendaftar.create({
      data: {
        nib: createPendaftarDto.nib,
        nama_pemilik: createPendaftarDto.nama_pemilik,
        nama_toko: createPendaftarDto.nama_toko,
        email: createPendaftarDto.email,
        status: 'menunggu',
      },
    });

    return {
      message: 'Pendaftaran berhasil dikirim dan sedang menunggu verifikasi.',
    };
  }

  async findAll(query: PendaftarQueryDto) {
    const { page, limit, search, status } = query; // Destructure semua properti
    const skip = (page - 1) * limit;

    const where: Prisma.PendaftarWhereInput = {};

    if (status && status.length > 0) {
      where.status = {
        in: status,
      };
    }

    if (search) {
      where.OR = [
        { nama_pemilik: { contains: search } },
        { email: { contains: search } },
        { nama_toko: { contains: search } },
      ];
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.pendaftar.findMany({
        skip,
        take: limit,
        where,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.pendaftar.count({ where }),
    ]);

    return {
      data: data,
      meta: {
        page,
        limit,
        totalData: total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const data = await this.prisma.pendaftar.findUnique({
      where: { id: id },
    });

    if (!data) {
      throw new Error('Data client tidak ditemukan.');
    }

    return data;
  }

  async update(id: number, updatePendaftarDto: UpdatePendaftarDto) {
    const { status } = updatePendaftarDto;

    const pendaftar = await this.findOne(id);

    await this.prisma.pendaftar.update({
      where: { id: id },
      data: {
        status: status,
      },
    });

    if (status === 'diterima') {
      const year = new Date().getFullYear();
      const rawPassword = `${pendaftar.nib}${year}`;
      const hashedPassword = await bcrypt.hash(rawPassword, 10);

      let slug = pendaftar.nama_toko.toLowerCase().replace(/\s/g, '-');
      let count = 1;
      let foundSlug = await this.prisma.toko.findUnique({
        where: { slug },
      });

      while (foundSlug) {
        count++;
        const newSlug = `${slug}-${count}`;
        foundSlug = await this.prisma.toko.findUnique({
          where: { slug: newSlug },
        });

        if (!foundSlug) {
          slug = newSlug;
          break;
        }
      }

      const { user, toko } = await this.prisma.$transaction(async (prisma) => {
        const user = await prisma.user.create({
          data: {
            email: pendaftar.email,
            username: pendaftar.email,
            password: hashedPassword,
          },
        });

        const role = await prisma.role.findUnique({
          where: { name: 'client' },
        });

        if (!role) {
          throw new ConflictException('Role Pemilik Toko tidak ditemukan');
        }

        const userRole = await prisma.userRole.create({
          data: {
            userId: user.id,
            roleId: role.id,
          },
        });

        const toko = await prisma.toko.create({
          data: {
            nama_toko: pendaftar.nama_toko,
            nib: pendaftar.nib,
            slug: slug,
          },
        });

        const cabang = await prisma.cabangToko.create({
          data: {
            nama_cabang: pendaftar.nama_toko,
            tokoId: toko.id,
            tipe: 'primer',
            status: 'aktif',
          },
        });

        await prisma.pemilikToko.create({
          data: {
            nama: pendaftar.nama_pemilik,
            jabatan: 'Owner',
            userId: user.id,
            tokoId: toko.id,
          },
        });

        return { user, toko };
      });

      try {
        await this.emailService.sendAcceptNotification(
          pendaftar,
          user as any,
          rawPassword,
        );
      } catch (emailError) {
        console.error(
          'Transaksi database berhasil, tetapi email gagal terkirim:',
          emailError,
        );
      }

      return { message: 'Pendaftar telah diterima.' };
    } else if (status === 'ditolak') {
      await this.emailService.sendRejectNotification(pendaftar);

      return { message: 'Pendaftar telah ditolak.' };
    }

    return { message: 'Status berhasil diubah.' };
  }

  async remove(id: number) {
    const data = await this.findOne(id);
    await this.prisma.pendaftar.delete({
      where: { id },
    });
  }
}
