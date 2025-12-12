import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsNumber, IsOptional, IsString } from 'class-validator';

export class QueryFaqDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Id Toko',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'toko id harus berupa angka' })
  tokoId: number;
}
