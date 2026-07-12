import { Test, TestingModule } from '@nestjs/testing';
import { ProdukService } from './produk.service';
import { PrismaService } from '@/prisma/prisma.service';
import { ForbiddenException } from '@nestjs/common';

describe('ProdukService', () => {
  let service: ProdukService;

  const mockPrismaService = {
    pemilikToko: {
      findUnique: jest.fn(),
    },
    cabangToko: {
      findMany: jest.fn(),
    },
    produk: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProdukService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ProdukService>(ProdukService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const mockFile = {
      fieldname: 'thumbnail',
      originalname: 'test.png',
      encoding: '7bit',
      mimetype: 'image/png',
      buffer: Buffer.from([]),
      size: 0,
      stream: null as any,
      destination: '',
      filename: 'test.png',
      path: 'public/uploads/test.png',
    };

    const validDto = {
      nama_produk: 'Produk Mantap',
      deskripsi: 'Deskripsi produk',
      harga: 15000,
      tokoId: 1,
      kategoriId: 2,
      cabangData: [
        { cabangId: 10, status: 'tersedia' as any },
      ],
      thumbnail: 'uploads/test.png',
      status: 'tampilkan' as any,
      hashtagIds: [5, 6],
    };

    it('should successfully create a product for admin (no getTokoIdForUser validation)', async () => {
      mockPrismaService.produk.findUnique.mockResolvedValue(null);
      
      const mockCreatedProduk = { id: 100, ...validDto, slug: 'produk-mantap' };
      mockPrismaService.produk.create.mockResolvedValue(mockCreatedProduk);

      const adminUser = { id: 1, roles: { name: 'admin' } }; // roles.name !== 'client'

      const result = await service.create(validDto, mockFile, adminUser);

      expect(result).toEqual(mockCreatedProduk);
      expect(mockPrismaService.produk.findUnique).toHaveBeenCalledWith({
        where: { slug: 'produk-mantap' },
      });
      expect(mockPrismaService.produk.create).toHaveBeenCalledWith({
        data: {
          nama_produk: 'Produk Mantap',
          deskripsi: 'Deskripsi produk',
          harga: 15000,
          tokoId: 1,
          kategoriId: 2,
          thumbnail: 'uploads/test.png',
          status: 'tampilkan',
          slug: 'produk-mantap',
          produkCabangs: {
            createMany: {
              data: [
                { cabangId: 10, status: 'tersedia' },
              ],
            },
          },
          hashtags: {
            createMany: {
              data: [
                { hashtagId: 5 },
                { hashtagId: 6 },
              ],
            },
          },
        },
      });
    });

    it('should successfully create a product for client user', async () => {
      mockPrismaService.produk.findUnique.mockResolvedValue(null);
      mockPrismaService.pemilikToko.findUnique.mockResolvedValue({ id: 9, tokoId: 4 });
      mockPrismaService.cabangToko.findMany.mockResolvedValue([
        { id: 10, tokoId: 4 },
      ]);

      const mockCreatedProduk = { id: 101, ...validDto, tokoId: 4, slug: 'produk-mantap' };
      mockPrismaService.produk.create.mockResolvedValue(mockCreatedProduk);

      const clientUser = { id: 2, roles: { name: 'client' } };

      const result = await service.create(validDto, mockFile, clientUser);

      expect(result).toEqual(mockCreatedProduk);
      expect(mockPrismaService.pemilikToko.findUnique).toHaveBeenCalledWith({
        where: { userId: clientUser.id },
      });
      expect(mockPrismaService.cabangToko.findMany).toHaveBeenCalledWith({
        where: { tokoId: 4 },
        select: { id: true },
      });
      expect(mockPrismaService.produk.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          tokoId: 4,
          slug: 'produk-mantap',
        }),
      });
    });

    it('should throw Error if cabangData is not provided', async () => {
      const invalidDto = { ...validDto, cabangData: undefined as any };

      await expect(service.create(invalidDto, mockFile, { id: 1 })).rejects.toThrow('cabangData is required');
    });

    it('should throw ForbiddenException if client user has no toko', async () => {
      mockPrismaService.pemilikToko.findUnique.mockResolvedValue(null);

      const clientUser = { id: 2, roles: { name: 'client' } };

      await expect(service.create(validDto, mockFile, clientUser)).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if client user tries to add branch not belonging to their toko', async () => {
      mockPrismaService.pemilikToko.findUnique.mockResolvedValue({ id: 9, tokoId: 4 });
      mockPrismaService.cabangToko.findMany.mockResolvedValue([
        { id: 11, tokoId: 4 }, // owned branches
      ]);

      const clientUser = { id: 2, roles: { name: 'client' } };

      await expect(service.create(validDto, mockFile, clientUser)).rejects.toThrow(ForbiddenException);
    });

    it('should throw Error if thumbnail is not provided', async () => {
      mockPrismaService.produk.findUnique.mockResolvedValue(null);
      const adminUser = { id: 1, roles: { name: 'admin' } };

      await expect(service.create(validDto, null as any, adminUser)).rejects.toThrow('Thumbnail is required');
    });

    it('should resolve slug conflict by auto-increment suffix', async () => {
      mockPrismaService.produk.findUnique
        .mockResolvedValueOnce({ id: 1, slug: 'produk-mantap' })
        .mockResolvedValueOnce(null);

      const mockCreatedProduk = { id: 102, ...validDto, slug: 'produk-mantap-2' };
      mockPrismaService.produk.create.mockResolvedValue(mockCreatedProduk);

      const adminUser = { id: 1, roles: { name: 'admin' } };

      const result = await service.create(validDto, mockFile, adminUser);

      expect(result).toEqual(mockCreatedProduk);
      expect(mockPrismaService.produk.findUnique).toHaveBeenNthCalledWith(1, {
        where: { slug: 'produk-mantap' },
      });
      expect(mockPrismaService.produk.findUnique).toHaveBeenNthCalledWith(2, {
        where: { slug: 'produk-mantap-2' },
      });
    });
  });
});
