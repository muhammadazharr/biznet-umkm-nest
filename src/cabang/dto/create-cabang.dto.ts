import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateCabangDto {
  @ApiProperty({
    description: 'Nama Cabang',
    example: 'Cabang 1',
  })
  @IsNotEmpty({ message: 'nama cabang tidak boleh kosong' })
  nama_cabang: string;

  @ApiProperty({
    description: 'Alamat Cabang',
    example: 'Jl. Merdeka No. 123, Jakarta',
  })
  @IsNotEmpty({ message: 'alamat cabang tidak boleh kosong' })
  alamat: string;

  @ApiProperty({
    description: 'Id Toko',
    example: 1,
  })
  @IsNotEmpty({ message: 'toko id tidak boleh kosong' })
  @IsNumber({}, { message: 'toko id harus berupa angka' })
  tokoId: number;

  @ApiProperty({
    description: 'Tipe Cabang',
    enum: ['primer', 'sekunder'],
  })
  @IsNotEmpty({ message: 'tipe cabang tidak boleh kosong' })
  @IsIn(['primer', 'sekunder'], {
    message: 'tipe harus berupa primer atau sekunder',
  })
  tipe: 'primer' | 'sekunder';

  @ApiProperty({
    description: 'Latitude Cabang',
    example: '-6.200000',
    required: false,
  })
  @IsOptional()
  latitude?: number;

  @ApiProperty({
    description: 'Longitude Cabang',
    example: '-6.200000',
    required: false,
  })
  @IsOptional()
  longitude?: number;

  @ApiProperty({
    description: 'Status Cabang',
    enum: ['aktif', 'nonaktif'],
  })
  @IsNotEmpty({ message: 'status cabang tidak boleh kosong' })
  @IsIn(['aktif', 'nonaktif'], {
    message: 'status harus berupa aktif atau nonaktif',
  })
  status: 'aktif' | 'nonaktif';
}
