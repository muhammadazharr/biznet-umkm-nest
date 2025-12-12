import { PartialType } from '@nestjs/swagger';
import { CreateSosialMediaDto } from './create-sosial-media.dto';

export class UpdateSosialMediaDto extends PartialType(CreateSosialMediaDto) {}
