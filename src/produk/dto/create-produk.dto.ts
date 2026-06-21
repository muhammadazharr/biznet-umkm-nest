import { ApiProperty } from '@nestjs/swagger';
import { VisibilitasProduk, StatusProduk } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsArray, ValidateNested, IsEnum } from 'class-validator';

export class CabangStatusDto {
  @ApiProperty({ example: 1, description: 'Id Cabang' })
  @IsNotEmpty({ message: 'cabang id tidak boleh kosong' })
  @Type(() => Number)
  @IsNumber({}, { message: 'cabang id harus berupa angka' })
  cabangId: number;

  @ApiProperty({ example: 'tersedia', description: 'Status Stok' })
  @IsNotEmpty({ message: 'status stok tidak boleh kosong' })
  @IsEnum(StatusProduk, { message: 'status stok tidak valid' })
  status: StatusProduk;
}

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

  @ApiProperty({
    example: '[{"cabangId": 1, "status": "tersedia"}]',
    description: 'Daftar Cabang dan Status Stok (JSON string atau array)',
  })
  @IsNotEmpty({ message: 'cabang data tidak boleh kosong' })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch (e) {
        return value;
      }
    }
    return value;
  })
  @IsArray({ message: 'cabang data harus berupa array' })
  @ValidateNested({ each: true })
  @Type(() => CabangStatusDto)
  cabangData: CabangStatusDto[];

  @ApiProperty({
    example: 'http://example.com/image.jpg',
    description: 'Thumbnail Produk',
  })
  @IsOptional()
  thumbnail: string;

  @IsOptional()
  @IsString({ message: 'status harus berupa string' })
  status: VisibilitasProduk;

  @ApiProperty({ example: [1, 2], description: 'Daftar Hashtag Id', required: false })
  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return [];
    if (typeof value === 'string') {
      if (value.trim() === '') return [];
      return [parseInt(value.trim(), 10)];
    }
    if (Array.isArray(value)) {
      return value.map((v) => parseInt(v.toString().trim(), 10));
    }
    return [parseInt(value, 10)];
  })
  @IsNumber({}, { each: true, message: 'hashtag ids harus berupa angka' })
  hashtagIds?: number[];
}
