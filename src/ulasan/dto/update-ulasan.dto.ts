import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateUlasanDto } from './create-ulasan.dto';
import { StatusUlasan } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

export class UpdateUlasanDto {
  @ApiProperty({ example: 'status', description: 'status' })
  @IsOptional()
  @IsEnum(StatusUlasan, {
    message: 'status harus berupa menunggu, tolak, atau terima',
  })
  status?: StatusUlasan;

  @ApiProperty({ example: 'Terima kasih atas masukannya', description: 'balasan toko' })
  @IsOptional()
  balasan?: string;
}
