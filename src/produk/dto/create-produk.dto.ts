import { ApiProperty } from '@nestjs/swagger';
import { VisibilitasProduk } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateProdukDto {
  @ApiProperty({ example: 'Produk A', description: 'Nama Produk' })
  @IsNotEmpty({ message: 'nama produk tidak boleh kosong' })
  nama_produk: string;

  @ApiProperty({ example: 'Produk A', description: 'Nama Produk' })
  deskripsi: string;

  @ApiProperty({ example: 10000, description: 'Harga Produk' })
  @IsNotEmpty({ message: 'harga produk tidak boleh kosong' })
  harga: number;

  @ApiProperty({ example: 1, description: 'Id Toko' })
  @IsNotEmpty({ message: 'toko id tidak boleh kosong' })
  @IsNumber({}, { message: 'toko id harus berupa angka' })
  tokoId: number;

  @ApiProperty({ example: 1, description: 'Id Kategori' })
  @IsNotEmpty({ message: 'kategori id tidak boleh kosong' })
  @IsNumber({}, { message: 'kategori id harus berupa angka' })
  kategoriId: number;

  @ApiProperty({ example: [1, 2], description: 'Daftar Cabang Id' })
  @IsNotEmpty({ message: 'cabang ids tidak boleh kosong' })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return [parseInt(value.trim(), 10)];
    }
    if (Array.isArray(value)) {
      return value.map((v) => parseInt(v.toString().trim(), 10));
    }
    return [parseInt(value, 10)];
  })
  @IsNumber({}, { each: true, message: 'cabang ids harus berupa angka' })
  cabangIds: number[];

  @ApiProperty({
    example: 'http://example.com/image.jpg',
    description: 'Thumbnail Produk',
  })
  @IsOptional()
  thumbnail: string;

  @IsOptional()
  @IsString({ message: 'status harus berupa string' })
  status: VisibilitasProduk;
}
