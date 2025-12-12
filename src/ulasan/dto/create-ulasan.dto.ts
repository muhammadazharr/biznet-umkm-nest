import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateUlasanDto {
  @ApiProperty({ example: 1, description: 'toko id' })
  @IsNotEmpty({ message: 'toko id tidak boleh kosong' })
  @IsNumber({}, { message: 'toko id harus berupa angka' })
  produkId: number;

  @ApiProperty({ example: 'John Doe', description: 'nama' })
  @IsNotEmpty({ message: 'nama tidak boleh kosong' })
  nama: string;

  @ApiProperty({ example: 5, description: 'nilai' })
  @IsNotEmpty({ message: 'nilai tidak boleh kosong' })
  @IsNumber({}, { message: 'nilai harus berupa angka' })
  nilai: number;

  @ApiProperty({ example: 'lorem ipsum', description: 'komentar' })
  komentar?: string;
}
