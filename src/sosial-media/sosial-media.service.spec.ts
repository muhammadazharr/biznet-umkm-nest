import { Test, TestingModule } from '@nestjs/testing';
import { SosialMediaService } from './sosial-media.service';

describe('SosialMediaService', () => {
  let service: SosialMediaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SosialMediaService],
    }).compile();

    service = module.get<SosialMediaService>(SosialMediaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
