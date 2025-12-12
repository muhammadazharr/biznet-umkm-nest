import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export class SosialMediaQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Id Toko',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'toko id harus berupa angka' })
  tokoId: number;
}
