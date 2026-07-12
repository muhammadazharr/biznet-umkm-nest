import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateHashtagDto {
  @ApiProperty({ example: 1, description: 'ID Toko' })
  @IsNotEmpty({ message: 'tokoId tidak boleh kosong' })
  @IsNumber({}, { message: 'tokoId harus berupa angka' })
  tokoId: number;

  @ApiProperty({ example: 'Pedas', description: 'Nama Hashtag' })
  @IsNotEmpty({ message: 'Nama hashtag tidak boleh kosong' })
  @IsString({ message: 'Nama hashtag harus berupa string' })
  nama: string;
}
