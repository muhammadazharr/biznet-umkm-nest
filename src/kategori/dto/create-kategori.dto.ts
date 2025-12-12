import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class CreateKategoriDto {
  @ApiProperty({ example: 'toko baju', description: 'nama kategori' })
  @IsNotEmpty({ message: 'nama tidak boleh kosong' })
  nama_kategori: string;

  @ApiProperty({
    example: 'toko',
    description: 'tipe kategori',
    required: true,
  })
  @IsNotEmpty({ message: 'tipe tidak boleh kosong' })
  @IsString({ message: 'tipe harus berupa string' })
  @IsIn(['toko', 'produk'], { message: 'tipe harus berupa toko atau produk' })
  tipe: 'toko' | 'produk';

  @ApiProperty({ example: 'FaIcon', description: 'nama icon' })
  @IsNotEmpty({ message: 'icon tidak boleh kosong' })
  icon: string;
}
