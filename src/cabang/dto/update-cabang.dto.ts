import { PartialType } from '@nestjs/swagger';
import { CreateCabangDto } from './create-cabang.dto';

export class UpdateCabangDto extends PartialType(CreateCabangDto) {}
