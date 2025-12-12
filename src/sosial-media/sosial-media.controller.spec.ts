import { Test, TestingModule } from '@nestjs/testing';
import { SosialMediaController } from './sosial-media.controller';
import { SosialMediaService } from './sosial-media.service';

describe('SosialMediaController', () => {
  let controller: SosialMediaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SosialMediaController],
      providers: [SosialMediaService],
    }).compile();

    controller = module.get<SosialMediaController>(SosialMediaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
