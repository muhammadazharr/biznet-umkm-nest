import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsNumber, IsOptional, IsString } from 'class-validator';

export class CabangQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Id Toko',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'toko id harus berupa angka' })
  tokoId: number;

  @ApiPropertyOptional({
    description: 'Status Cabang',
    enum: ['aktif', 'nonaktif'],
  })
  @IsOptional({ message: 'status cabang tidak boleh kosong' })
  @IsIn(['aktif', 'nonaktif'], {
    message: 'status harus berupa aktif atau nonaktif',
  })
  status: 'aktif' | 'nonaktif';
}
