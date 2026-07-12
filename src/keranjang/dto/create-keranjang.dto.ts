import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateKeranjangDto {
  @IsNotEmpty()
  @IsNumber()
  tokoId: number;

  @IsNotEmpty()
  @IsNumber()
  produkId: number;

  @IsNotEmpty()
  @IsNumber()
  quantiti: number;
}
