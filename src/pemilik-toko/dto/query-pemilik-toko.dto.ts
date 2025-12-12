import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Status } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class QueryPemilikTokoDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Id Toko',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'toko id harus berupa angka' })
  tokoId: number;

  @ApiPropertyOptional({
    description: 'Status Pendaftar',
  })
  @IsOptional()
  @IsEnum(Status, {
    message: 'status tidak valid',
  })
  @Transform(({ value }) => value.toLowerCase())
  status: Status;
}
