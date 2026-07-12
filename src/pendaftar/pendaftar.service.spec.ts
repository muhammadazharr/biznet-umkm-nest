import { Test, TestingModule } from '@nestjs/testing';
import { PendaftarService } from './pendaftar.service';
import { PrismaService } from '@/prisma/prisma.service';
import { EmailService } from '@/email/email.service';
import { ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('PendaftarService', () => {
  let service: PendaftarService;
  let emailService: jest.Mocked<EmailService>;

  const mockTransactionPrisma = {
    user: {
      create: jest.fn(),
    },
    role: {
      findUnique: jest.fn(),
    },
    userRole: {
      create: jest.fn(),
    },
    toko: {
      create: jest.fn(),
    },
    cabangToko: {
      create: jest.fn(),
    },
    pemilikToko: {
      create: jest.fn(),
    },
  };

  const mockPrismaService = {
    user: {
      findFirst: jest.fn(),
    },
    pendaftar: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    toko: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn().mockImplementation((arg) => {
      if (typeof arg === 'function') {
        return arg(mockTransactionPrisma);
      }
      return Promise.all(arg);
    }),
  };

  const mockEmailService = {
    sendAcceptNotification: jest.fn(),
    sendRejectNotification: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PendaftarService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: EmailService, useValue: mockEmailService },
      ],
    }).compile();

    service = module.get<PendaftarService>(PendaftarService);
    emailService = module.get(EmailService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto = {
      email: 'pendaftar@example.com',
      nama_pemilik: 'Budi Pemilik',
      nama_toko: 'Toko Baru',
      nib: '987654321',
    };

    it('should successfully submit registration', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);
      mockPrismaService.pendaftar.findFirst.mockResolvedValue(null);
      mockPrismaService.pendaftar.create.mockResolvedValue({ id: 1, ...createDto });

      const result = await service.create(createDto);

      expect(result).toEqual({
        message: 'Pendaftaran berhasil dikirim dan sedang menunggu verifikasi.',
      });
      expect(mockPrismaService.user.findFirst).toHaveBeenCalledWith({
        where: { email: createDto.email },
      });
      expect(mockPrismaService.pendaftar.findFirst).toHaveBeenCalledWith({
        where: { email: createDto.email },
      });
      expect(mockPrismaService.pendaftar.create).toHaveBeenCalledWith({
        data: {
          nib: createDto.nib,
          nama_pemilik: createDto.nama_pemilik,
          nama_toko: createDto.nama_toko,
          email: createDto.email,
          status: 'menunggu',
        },
      });
    });

    it('should throw ConflictException if user email already exists', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue({ id: 1, email: createDto.email });
      mockPrismaService.pendaftar.findFirst.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if pendaftar email already exists', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);
      mockPrismaService.pendaftar.findFirst.mockResolvedValue({ id: 2, email: createDto.email });

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return paginated data and metadata', async () => {
      const query = { page: 1, limit: 10, search: 'Budi', status: ['menunggu'] as any };
      const mockList = [{ id: 1, nama_pemilik: 'Budi' }];
      const mockCount = 1;

      mockPrismaService.pendaftar.findMany.mockResolvedValue(mockList);
      mockPrismaService.pendaftar.count.mockResolvedValue(mockCount);

      const result = await service.findAll(query);

      expect(result).toEqual({
        data: mockList,
        meta: {
          page: 1,
          limit: 10,
          totalData: 1,
          totalPages: 1,
        },
      });

      expect(mockPrismaService.pendaftar.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: {
          status: { in: ['menunggu'] },
          OR: [
            { nama_pemilik: { contains: 'Budi' } },
            { email: { contains: 'Budi' } },
            { nama_toko: { contains: 'Budi' } },
          ],
        },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return pendaftar if found', async () => {
      const mockPendaftar = { id: 1, email: 'test@example.com' };
      mockPrismaService.pendaftar.findUnique.mockResolvedValue(mockPendaftar);

      const result = await service.findOne(1);
      expect(result).toEqual(mockPendaftar);
      expect(mockPrismaService.pendaftar.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw Error if not found', async () => {
      mockPrismaService.pendaftar.findUnique.mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow('Data client tidak ditemukan.');
    });
  });

  describe('update', () => {
    const mockPendaftar = {
      id: 5,
      email: 'pendaftar@example.com',
      nama_pemilik: 'Budi',
      nama_toko: 'Toko Budi',
      nib: '12345',
      status: 'menunggu',
    };

    it('should successfully update status to diterima, create user/toko, and send email', async () => {
      mockPrismaService.pendaftar.findUnique.mockResolvedValue(mockPendaftar);
      mockPrismaService.toko.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

      const mockUser = { id: 10, email: 'pendaftar@example.com' };
      const mockRole = { id: 2, name: 'client' };
      const mockToko = { id: 20, nama_toko: 'Toko Budi' };

      mockTransactionPrisma.user.create.mockResolvedValue(mockUser);
      mockTransactionPrisma.role.findUnique.mockResolvedValue(mockRole);
      mockTransactionPrisma.toko.create.mockResolvedValue(mockToko);

      const result = await service.update(5, { status: 'diterima' as any });

      expect(result).toEqual({ message: 'Pendaftar telah diterima.' });
      expect(mockPrismaService.pendaftar.update).toHaveBeenCalledWith({
        where: { id: 5 },
        data: { status: 'diterima' },
      });
      expect(mockTransactionPrisma.user.create).toHaveBeenCalledWith({
        data: {
          email: mockPendaftar.email,
          username: mockPendaftar.email,
          password: 'hashedPassword',
        },
      });
      expect(mockTransactionPrisma.role.findUnique).toHaveBeenCalledWith({
        where: { name: 'client' },
      });
      expect(mockTransactionPrisma.userRole.create).toHaveBeenCalledWith({
        data: {
          userId: mockUser.id,
          roleId: mockRole.id,
        },
      });
      expect(mockTransactionPrisma.toko.create).toHaveBeenCalledWith({
        data: {
          nama_toko: mockPendaftar.nama_toko,
          nib: mockPendaftar.nib,
          slug: 'toko-budi',
        },
      });
      expect(mockTransactionPrisma.cabangToko.create).toHaveBeenCalledWith({
        data: {
          nama_cabang: mockPendaftar.nama_toko,
          tokoId: mockToko.id,
          tipe: 'primer',
          status: 'aktif',
        },
      });
      expect(mockTransactionPrisma.pemilikToko.create).toHaveBeenCalledWith({
        data: {
          nama: mockPendaftar.nama_pemilik,
          jabatan: 'Owner',
          userId: mockUser.id,
          tokoId: mockToko.id,
        },
      });
      expect(emailService.sendAcceptNotification).toHaveBeenCalledWith(
        mockPendaftar,
        mockUser,
        '12345678',
      );
    });

    it('should successfully update status to ditolak and send reject email', async () => {
      mockPrismaService.pendaftar.findUnique.mockResolvedValue(mockPendaftar);

      const result = await service.update(5, { status: 'ditolak' as any });

      expect(result).toEqual({ message: 'Pendaftar telah ditolak.' });
      expect(mockPrismaService.pendaftar.update).toHaveBeenCalledWith({
        where: { id: 5 },
        data: { status: 'ditolak' },
      });
      expect(emailService.sendRejectNotification).toHaveBeenCalledWith(mockPendaftar);
    });

    it('should change status to something else (e.g. menunggu) without creating user/toko', async () => {
      mockPrismaService.pendaftar.findUnique.mockResolvedValue(mockPendaftar);

      const result = await service.update(5, { status: 'menunggu' as any });

      expect(result).toEqual({ message: 'Status berhasil diubah.' });
      expect(mockPrismaService.pendaftar.update).toHaveBeenCalledWith({
        where: { id: 5 },
        data: { status: 'menunggu' },
      });
      expect(emailService.sendAcceptNotification).not.toHaveBeenCalled();
      expect(emailService.sendRejectNotification).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should find and delete pendaftar', async () => {
      const mockPendaftar = { id: 1, email: 'test@example.com' };
      mockPrismaService.pendaftar.findUnique.mockResolvedValue(mockPendaftar);

      await service.remove(1);

      expect(mockPrismaService.pendaftar.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });
});
