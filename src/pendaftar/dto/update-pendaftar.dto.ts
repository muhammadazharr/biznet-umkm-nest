import { IsNotEmpty, IsString } from 'class-validator';

export class UpdatePendaftarDto {
  @IsNotEmpty({ message: 'status tidak boleh kosong' })
  @IsString({ message: 'status harus berupa string' })
  status: 'menunggu' | 'ditolak' | 'diterima';
}
