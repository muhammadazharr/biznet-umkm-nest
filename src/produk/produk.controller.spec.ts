import { Test, TestingModule } from '@nestjs/testing';
import { ProdukController } from './produk.controller';
import { ProdukService } from './produk.service';
import { CreateProdukDto } from './dto/create-produk.dto';

describe('ProdukController', () => {
  let controller: ProdukController;
  let service: jest.Mocked<ProdukService>;

  const mockProdukService = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProdukController],
      providers: [
        { provide: ProdukService, useValue: mockProdukService },
      ],
    }).compile();

    controller = module.get<ProdukController>(ProdukController);
    service = module.get(ProdukService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should successfully invoke service create and return success response', async () => {
      const createDto: CreateProdukDto = {
        nama_produk: 'Produk Baru',
        deskripsi: 'Deskripsi',
        harga: 5000,
        tokoId: 1,
        kategoriId: 3,
        cabangData: [],
        thumbnail: '',
        status: 'tampilkan' as any,
      };

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
      } as Express.Multer.File;

      const mockReq = {
        user: { id: 1, email: 'test@example.com' },
      };

      mockProdukService.create.mockResolvedValue({ id: 1 });

      const result = await controller.create(createDto, mockFile, mockReq);

      expect(mockProdukService.create).toHaveBeenCalledWith(createDto, mockFile, mockReq.user);
      expect(result).toEqual({
        success: true,
        statusCode: 200,
        message: 'Produk berhasil dibuat',
        data: null,
      });
    });
  });
});
