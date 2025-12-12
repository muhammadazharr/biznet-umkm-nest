import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export class QueryUlasanDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Id produk',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'produk id harus berupa angka' })
  produkId: number;
}
