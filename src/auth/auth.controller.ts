import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from './decorators/public.decorator';
import { VerifyDto } from './dto/verify.dto';
import { ApiResponse } from '@/common/helpers/api-response.helper';
import { ResendCodeDto } from './dto/resend-code.dto';

@ApiTags('Autentikasi')
@Controller('api/auth')
export class AuthController {
  constructor(private readonly AuthService: AuthService) {}

  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const user = await this.AuthService.validateUser(
      loginDto.email,
      loginDto.password,
    );
    if (!user) {
      throw new UnauthorizedException('Email atau password salah');
    }

    const login = await this.AuthService.login(user);
    return ApiResponse.successWithData('Login berhasil', login);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @Get('me')
  async me(@Request() req: any) {
    const userProfile = await this.AuthService.getProfile(req.user);
    return ApiResponse.successWithData(
      'Profil pengguna berhasil diambil',
      userProfile,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @Post('logout')
  async logout(@Request() req: any) {
    const token = req.headers.authorization.split(' ')[1];
    await this.AuthService.logout(token);
    return ApiResponse.success('Logout berhasil');
  }
}
