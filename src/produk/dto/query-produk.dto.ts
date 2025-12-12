import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { VisibilitasProduk } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';

export class QueryProdukDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Id Toko',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'toko id harus berupa angka' })
  tokoId: number;

  @ApiPropertyOptional({
    description: 'Id Cabang',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'cabang id harus berupa angka' })
  cabangIds?: number[];

  @ApiPropertyOptional({
    description: 'Id Kategori',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'kategori id harus berupa angka' })
  kategoriId: number;

  @ApiPropertyOptional({
    description: 'Status pengguna',
    default: 'active',
  })
  @IsOptional()
  @IsEnum(VisibilitasProduk, {
    each: true,
    message: `Status harus berisi salah satu dari: ${Object.values(VisibilitasProduk).join(', ')}`,
  })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',');
    }
    return value;
  })
  status?: VisibilitasProduk[];
}
