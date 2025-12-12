import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { StatusToko } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional } from 'class-validator';

export class TokoQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Status pengguna',
    default: 'active',
  })
  @IsOptional()
  @IsEnum(StatusToko, {
    each: true,
    message: `Status harus berisi salah satu dari: ${Object.values(StatusToko).join(', ')}`,
  })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',');
    }
    return value;
  })
  status?: StatusToko[];
}
