import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { KategoriEnum } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class KategoriQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Status pengguna',
    default: 'active',
  })
  @IsOptional()
  @IsEnum(KategoriEnum, {
    each: true,
    message: `Status harus berisi salah satu dari: ${Object.values(KategoriEnum).join(', ')}`,
  })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',');
    }
    return value;
  })
  tipe?: KategoriEnum[];
}
