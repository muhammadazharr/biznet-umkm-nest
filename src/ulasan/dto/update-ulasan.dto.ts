import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateUlasanDto } from './create-ulasan.dto';
import { StatusUlasan } from '@prisma/client';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateUlasanDto extends PartialType(CreateUlasanDto) {
  @ApiProperty({ example: 'status', description: 'status' })
  @IsNotEmpty({ message: 'status tidak boleh kosong' })
  @IsEnum(StatusUlasan, {
    message: 'status harus berupa menunggu, ditolak, atau diterima',
  })
  status: StatusUlasan;
}
