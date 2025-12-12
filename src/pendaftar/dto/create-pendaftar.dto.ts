import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreatePendaftarDto {
  @ApiProperty({ example: 'admin@example.id', description: 'email' })
  @IsEmail({}, { message: 'email tidak valid' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'john doe', description: 'name' })
  @IsNotEmpty({ message: 'nama pemilik tidak boleh kosong' })
  nama_pemilik: string;

  @ApiProperty({ example: 'nib', description: 'nib' })
  @IsNotEmpty({ message: 'nib tidak boleh kosong' })
  nib: string;

  @ApiProperty({ example: 'nama_toko', description: 'nama_toko' })
  @IsNotEmpty({ message: 'nama_toko tidak boleh kosong' })
  nama_toko: string;
}
