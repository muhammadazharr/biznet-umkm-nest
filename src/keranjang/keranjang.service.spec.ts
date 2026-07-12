import { Test, TestingModule } from '@nestjs/testing';
import { KeranjangService } from './keranjang.service';

describe('KeranjangService', () => {
  let service: KeranjangService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KeranjangService],
    }).compile();

    service = module.get<KeranjangService>(KeranjangService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
