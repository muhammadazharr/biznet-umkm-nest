import { Test, TestingModule } from '@nestjs/testing';
import { PendaftarController } from './pendaftar.controller';
import { PendaftarService } from './pendaftar.service';
import { CreatePendaftarDto } from './dto/create-pendaftar.dto';
import { UpdatePendaftarDto } from './dto/update-pendaftar.dto';

describe('PendaftarController', () => {
  let controller: PendaftarController;
  let service: jest.Mocked<PendaftarService>;

  const mockPendaftarService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PendaftarController],
      providers: [
        { provide: PendaftarService, useValue: mockPendaftarService },
      ],
    }).compile();

    controller = module.get<PendaftarController>(PendaftarController);
    service = module.get(PendaftarService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should submit registration and return success response', async () => {
      const dto: CreatePendaftarDto = {
        email: 'pendaftar@example.com',
        nama_pemilik: 'Budi Pemilik',
        nama_toko: 'Toko Baru',
        nib: '987654321',
      };

      mockPendaftarService.create.mockResolvedValue({
        message: 'Pendaftaran berhasil dikirim dan sedang menunggu verifikasi.',
      });

      const result = await controller.create(dto);

      expect(mockPendaftarService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual({
        success: true,
        statusCode: 200,
        message: 'Pendaftaran berhasil dikirim dan sedang menunggu verifikasi.',
        data: null,
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated registrants', async () => {
      const query = { page: 1, limit: 10, search: '', status: [] };
      const serviceResult = {
        data: [{ id: 1, email: 'pendaftar@example.com' }],
        meta: { page: 1, limit: 10, totalData: 1, totalPages: 1 },
      };

      mockPendaftarService.findAll.mockResolvedValue(serviceResult);

      const result = await controller.findAll(query);

      expect(mockPendaftarService.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual({
        success: true,
        statusCode: 200,
        message: 'Data pendaftar berhasil diambil',
        data: serviceResult.data,
        meta: serviceResult.meta,
      });
    });
  });

  describe('findOne', () => {
    it('should return single registrant detail', async () => {
      const mockResult = { id: 3, email: 'test@example.com' };
      mockPendaftarService.findOne.mockResolvedValue(mockResult);

      const result = await controller.findOne('3');

      expect(mockPendaftarService.findOne).toHaveBeenCalledWith(3);
      expect(result).toEqual({
        success: true,
        statusCode: 200,
        message: 'Data pendaftar berhasil diambil',
        data: mockResult,
      });
    });
  });

  describe('update', () => {
    it('should update registrant status and return message', async () => {
      const dto: UpdatePendaftarDto = { status: 'diterima' as any };
      mockPendaftarService.update.mockResolvedValue({ message: 'Pendaftar telah diterima.' });

      const result = await controller.update('5', dto);

      expect(mockPendaftarService.update).toHaveBeenCalledWith(5, dto);
      expect(result).toEqual({
        success: true,
        statusCode: 200,
        message: 'Pendaftar telah diterima.',
        data: null,
      });
    });
  });

  describe('remove', () => {
    it('should delete registrant and return success message', async () => {
      mockPendaftarService.remove.mockResolvedValue(undefined);

      const result = await controller.remove('7');

      expect(mockPendaftarService.remove).toHaveBeenCalledWith(7);
      expect(result).toEqual({
        success: true,
        statusCode: 200,
        message: 'Data pendaftar berhasil dihapus',
        data: null,
      });
    });
  });
});
