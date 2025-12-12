import { Test, TestingModule } from '@nestjs/testing';
import { PemilikTokoController } from './pemilik-toko.controller';
import { PemilikTokoService } from './pemilik-toko.service';

describe('PemilikTokoController', () => {
  let controller: PemilikTokoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PemilikTokoController],
      providers: [PemilikTokoService],
    }).compile();

    controller = module.get<PemilikTokoController>(PemilikTokoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
