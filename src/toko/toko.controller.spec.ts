import { Test, TestingModule } from '@nestjs/testing';
import { TokoController } from './toko.controller';
import { TokoService } from './toko.service';
import { CreateTokoDto } from './dto/create-toko.dto';

describe('TokoController', () => {
  let controller: TokoController;
  let service: jest.Mocked<TokoService>;

  const mockTokoService = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TokoController],
      providers: [
        { provide: TokoService, useValue: mockTokoService },
      ],
    }).compile();

    controller = module.get<TokoController>(TokoController);
    service = module.get(TokoService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should successfully register a store and return response', async () => {
      const createDto: CreateTokoDto = {
        email: 'owner@example.com',
        nama_pemilik: 'Budi Pemilik',
        nama_toko: 'Toko Budi',
        nib: '1234567890',
        status: 'aktif' as any,
      };

      mockTokoService.create.mockResolvedValue({ id: 1, nama_toko: 'Toko Budi' });

      const result = await controller.create(createDto);

      expect(mockTokoService.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual({
        success: true,
        statusCode: 200,
        message: 'Toko berhasil dibuat',
        data: null,
      });
    });
  });
});
