import { Test, TestingModule } from '@nestjs/testing';
import { PemilikTokoService } from './pemilik-toko.service';

describe('PemilikTokoService', () => {
  let service: PemilikTokoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PemilikTokoService],
    }).compile();

    service = module.get<PemilikTokoService>(PemilikTokoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
