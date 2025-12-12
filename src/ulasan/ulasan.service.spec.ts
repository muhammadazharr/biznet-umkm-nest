import { Test, TestingModule } from '@nestjs/testing';
import { UlasanService } from './ulasan.service';

describe('UlasanService', () => {
  let service: UlasanService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UlasanService],
    }).compile();

    service = module.get<UlasanService>(UlasanService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
