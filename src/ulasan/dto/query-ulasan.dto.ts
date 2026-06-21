import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsEnum } from 'class-validator';
import { StatusUlasan } from '@prisma/client';

export class QueryUlasanDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Id produk',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'produk id harus berupa angka' })
  produkId?: number;

  @ApiPropertyOptional({
    description: 'Id toko',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'toko id harus berupa angka' })
  tokoId?: number;

  @ApiPropertyOptional({
    description: 'Status ulasan',
  })
  @IsOptional()
  @IsEnum(StatusUlasan, { message: 'status harus berupa menunggu, tolak, atau terima' })
  status?: StatusUlasan;

  @ApiPropertyOptional({
    description: 'Nilai rating ulasan',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'nilai harus berupa angka' })
  nilai?: number;
}
