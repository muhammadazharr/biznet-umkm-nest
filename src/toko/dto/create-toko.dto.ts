import { ApiProperty } from '@nestjs/swagger';
import { StatusToko } from '@prisma/client';
import { IsNotEmpty } from 'class-validator';

export class CreateTokoDto {
  @ApiProperty({ example: 'admin@example.id', description: 'email' })
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

  @ApiProperty({ example: 'status', description: 'status' })
  @IsNotEmpty({ message: 'status tidak boleh kosong' })
  status: StatusToko;
}
