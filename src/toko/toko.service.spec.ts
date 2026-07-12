import { Test, TestingModule } from '@nestjs/testing';
import { TokoService } from './toko.service';
import { PrismaService } from '@/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('TokoService', () => {
  let service: TokoService;
  let configService: jest.Mocked<ConfigService>;

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
  };

  const mockPrismaService = {
    user: {
      findFirst: jest.fn(),
    },
    toko: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn().mockImplementation((callback) => {
      return callback(mockTransactionPrisma);
    }),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokoService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<TokoService>(TokoService);
    configService = module.get(ConfigService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto = {
      email: 'owner@example.com',
      nama_pemilik: 'Budi Pemilik',
      nama_toko: 'Toko Budi',
      nib: '1234567890',
      status: 'aktif' as any,
    };

    it('should successfully register a store and return created toko info', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);
      mockPrismaService.toko.findUnique.mockResolvedValue(null);

      mockConfigService.get.mockReturnValue('defaultPassword123');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedDefaultPassword');

      const mockCreatedUser = { id: 10, email: createDto.email };
      const mockRole = { id: 2, name: 'client' };
      const mockCreatedUserRole = { id: 5, userId: 10, roleId: 2 };
      const mockCreatedToko = { id: 20, nama_toko: createDto.nama_toko, slug: 'toko-budi' };
      const mockCreatedCabang = { id: 30, tokoId: 20, nama_cabang: createDto.nama_toko };

      mockTransactionPrisma.user.create.mockResolvedValue(mockCreatedUser);
      mockTransactionPrisma.role.findUnique.mockResolvedValue(mockRole);
      mockTransactionPrisma.userRole.create.mockResolvedValue(mockCreatedUserRole);
      mockTransactionPrisma.toko.create.mockResolvedValue(mockCreatedToko);
      mockTransactionPrisma.cabangToko.create.mockResolvedValue(mockCreatedCabang);

      const result = await service.create(createDto);

      expect(result).toEqual(mockCreatedToko);
      expect(mockPrismaService.user.findFirst).toHaveBeenCalledWith({
        where: { email: createDto.email },
      });
      expect(mockPrismaService.toko.findUnique).toHaveBeenCalledWith({
        where: { slug: 'toko-budi' },
      });
      expect(mockConfigService.get).toHaveBeenCalledWith('PASSWORD_DEFAULT');
      expect(bcrypt.hash).toHaveBeenCalledWith('defaultPassword123', 10);

      expect(mockTransactionPrisma.user.create).toHaveBeenCalledWith({
        data: {
          email: createDto.email,
          username: createDto.nama_pemilik,
          password: 'hashedDefaultPassword',
        },
      });
      expect(mockTransactionPrisma.role.findUnique).toHaveBeenCalledWith({
        where: { name: 'client' },
      });
      expect(mockTransactionPrisma.userRole.create).toHaveBeenCalledWith({
        data: {
          userId: mockCreatedUser.id,
          roleId: mockRole.id,
        },
      });
      expect(mockTransactionPrisma.toko.create).toHaveBeenCalledWith({
        data: {
          nama_toko: createDto.nama_toko,
          nib: createDto.nib,
          slug: 'toko-budi',
          PemilikToko: {
            create: {
              nama: createDto.nama_pemilik,
              jabatan: 'Owner',
              userId: mockCreatedUser.id,
            },
          },
        },
      });
      expect(mockTransactionPrisma.cabangToko.create).toHaveBeenCalledWith({
        data: {
          tokoId: mockCreatedToko.id,
          nama_cabang: createDto.nama_toko,
          tipe: 'primer',
          status: 'aktif',
        },
      });
    });

    it('should throw ConflictException if email is already registered', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue({ id: 1, email: createDto.email });

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
      expect(mockPrismaService.user.findFirst).toHaveBeenCalledWith({
        where: { email: createDto.email },
      });
      expect(mockPrismaService.$transaction).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if client role is not found in database', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);
      mockPrismaService.toko.findUnique.mockResolvedValue(null);
      mockTransactionPrisma.user.create.mockResolvedValue({ id: 10, email: createDto.email });
      mockTransactionPrisma.role.findUnique.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
      expect(mockTransactionPrisma.role.findUnique).toHaveBeenCalledWith({
        where: { name: 'client' },
      });
    });

    it('should auto-increment slug suffix if slug already exists', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);
      // First slug check ('toko-budi') exists, second ('toko-budi-2') is free
      mockPrismaService.toko.findUnique
        .mockResolvedValueOnce({ id: 1, slug: 'toko-budi' })
        .mockResolvedValueOnce(null);

      const mockCreatedUser = { id: 10, email: createDto.email };
      const mockRole = { id: 2, name: 'client' };
      const mockCreatedToko = { id: 20, nama_toko: createDto.nama_toko, slug: 'toko-budi-2' };

      mockTransactionPrisma.user.create.mockResolvedValue(mockCreatedUser);
      mockTransactionPrisma.role.findUnique.mockResolvedValue(mockRole);
      mockTransactionPrisma.toko.create.mockResolvedValue(mockCreatedToko);

      const result = await service.create(createDto);

      expect(result).toEqual(mockCreatedToko);
      expect(mockPrismaService.toko.findUnique).toHaveBeenNthCalledWith(1, {
        where: { slug: 'toko-budi' },
      });
      expect(mockPrismaService.toko.findUnique).toHaveBeenNthCalledWith(2, {
        where: { slug: 'toko-budi-2' },
      });
      expect(mockTransactionPrisma.toko.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          slug: 'toko-budi-2',
        }),
      });
    });
  });
});
