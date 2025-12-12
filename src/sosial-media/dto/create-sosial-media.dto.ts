import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateSosialMediaDto {
  @ApiProperty({ example: 1, description: 'toko id' })
  @IsNotEmpty({ message: 'toko id tidak boleh kosong' })
  @IsNumber({}, { message: 'toko id harus berupa angka' })
  tokoId: number;

  @ApiProperty({ example: 'Facebook', description: 'nama sosial media' })
  @IsNotEmpty({ message: 'nama sosial media tidak boleh kosong' })
  nama: string;

  @ApiProperty({
    example: 'https://facebook.com/umkmktg',
    description: 'url sosial media',
  })
  @IsNotEmpty({ message: 'url sosial media tidak boleh kosong' })
  url: string;

  @ApiProperty({ example: 'facebook', description: 'tipe sosial media' })
  @IsNotEmpty({ message: 'tipe sosial media tidak boleh kosong' })
  @IsIn(['facebook', 'instagram', 'twitter', 'linkedin', 'youtube'], {
    message:
      'tipe harus berupa salah satu dari: facebook, instagram, twitter, linkedin, youtube',
  })
  tipe: 'facebook' | 'instagram' | 'twitter' | 'linkedin' | 'youtube';
}
