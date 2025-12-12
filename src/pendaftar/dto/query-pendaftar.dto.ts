import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { StatusPendaftar } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional } from 'class-validator';

export class PendaftarQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Status pengguna',
    default: 'active',
  })
  @IsOptional()
  @IsEnum(StatusPendaftar, {
    each: true,
    message: `Status harus berisi salah satu dari: ${Object.values(StatusPendaftar).join(', ')}`,
  })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',');
    }
    return value;
  })
  status?: StatusPendaftar[];
}
