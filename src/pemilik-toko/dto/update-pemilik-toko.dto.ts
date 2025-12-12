import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreatePemilikTokoDto } from './create-pemilik-toko.dto';
import { IsOptional, IsString } from 'class-validator';
import { Status } from '@prisma/client';

export class UpdatePemilikTokoDto extends PartialType(CreatePemilikTokoDto) {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'File gambar profil (JPG, PNG, JPEG)',
    required: true,
  })
  photo: Express.Multer.File;

  @IsOptional()
  @IsString({ message: 'status harus berupa string' })
  status: Status;

  @IsOptional()
  @IsString({ message: 'jabatan harus berupa string' })
  jabatan: string;

  @IsOptional()
  @IsString({ message: 'nama harus berupa string' })
  nama: string;
}
