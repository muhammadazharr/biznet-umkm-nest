import { PartialType } from '@nestjs/swagger';
import { CreateKeranjangDto } from './create-keranjang.dto';

export class UpdateKeranjangDto extends PartialType(CreateKeranjangDto) {}
