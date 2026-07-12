import { Test, TestingModule } from '@nestjs/testing';
import { KeranjangController } from './keranjang.controller';
import { KeranjangService } from './keranjang.service';

describe('KeranjangController', () => {
  let controller: KeranjangController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KeranjangController],
      providers: [KeranjangService],
    }).compile();

    controller = module.get<KeranjangController>(KeranjangController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
