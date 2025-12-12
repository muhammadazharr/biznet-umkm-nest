import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreatePemilikTokoDto } from './create-pemilik-toko.dto';
import { IsNotEmpty } from 'class-validator';

export class ResetPasswordPemilikTokoDto {
  @ApiProperty({ example: 'currentPassword', description: 'old password' })
  @IsNotEmpty()
  currentPassword: string;

  @ApiProperty({ example: 'newpassword', description: 'new password' })
  @IsNotEmpty()
  newPassword: string;
}
