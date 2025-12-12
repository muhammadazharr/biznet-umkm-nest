import { Test, TestingModule } from '@nestjs/testing';
import { UlasanController } from './ulasan.controller';
import { UlasanService } from './ulasan.service';

describe('UlasanController', () => {
  let controller: UlasanController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UlasanController],
      providers: [UlasanService],
    }).compile();

    controller = module.get<UlasanController>(UlasanController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
