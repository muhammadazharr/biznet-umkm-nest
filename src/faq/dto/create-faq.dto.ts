import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateFaqDto {
  @ApiProperty({ example: 1, description: 'ID Toko' })
  @IsNotEmpty({ message: 'tokoId tidak boleh kosong' })
  @IsNumber({}, { message: 'tokoId harus berupa angka' })
  tokoId: number;

  @ApiProperty({ example: 'pertanyaan', description: 'pertanyaan' })
  @IsNotEmpty({ message: 'Pertanyaaan tidak boleh kosong' })
  pertanyaan: string;

  @ApiProperty({ example: 'jawaban', description: 'jawaban' })
  @IsNotEmpty({ message: 'Jawaban tidak boleh kosong' })
  jawaban: string;
}
