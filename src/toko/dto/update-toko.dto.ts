import { ApiProperty, PartialType } from '@nestjs/swagger';
import { StatusToko } from '@prisma/client';
import { IsNotEmpty } from 'class-validator';

export class UpdateTokoDto {
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
