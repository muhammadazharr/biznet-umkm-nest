import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreatePemilikTokoDto {
  @ApiProperty({ example: 'admin@example.id', description: 'email' })
  @IsNotEmpty()
  nama_pemilik: string;

  @ApiProperty({ example: 'admin@example.id', description: 'email' })
  @IsEmail({}, { message: 'email tidak valid' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 1, description: 'toko id' })
  @IsNotEmpty({ message: 'toko id tidak boleh kosong' })
  @IsNumber({}, { message: 'toko id harus berupa angka' })
  tokoId: number;
}
