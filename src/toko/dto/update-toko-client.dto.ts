import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateTokoDto } from './create-toko.dto';
import { IsArray, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateTokoClientDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'File gambar profil (JPG, PNG, JPEG)',
    required: true,
  })
  logo: string;

  @ApiProperty({ example: 'lorem ipsum', description: 'description' })
  @IsOptional()
  deskripsi: string;

  @ApiProperty({ example: 'lorem ipsum', description: 'description' })
  @IsOptional()
  nomor_hp: string;

  @ApiProperty({ example: 'nib', description: 'nib' })
  @IsNotEmpty({ message: 'nib tidak boleh kosong' })
  nib: string;

  @ApiProperty({ example: 'nama_toko', description: 'nama_toko' })
  @IsNotEmpty({ message: 'nama_toko tidak boleh kosong' })
  nama_toko: string;

  @ApiProperty({
    example: [1, 2, 3],
    description: 'array of category id',
    type: [Number],
  })
  @IsNotEmpty({ message: 'category id tidak boleh kosong' })
  @IsArray()
  kategori_id: number[];
}
