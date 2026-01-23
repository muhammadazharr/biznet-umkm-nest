import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
import { HasRoles } from '@/auth/decorators/roles.decorator';
import { ApiResponse } from '@/common/helpers/api-response.helper';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('api/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('client')
  @HasRoles('client')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async dashboardClient(@Req() req: any) {
    const result = await this.dashboardService.dashboardClient(req.user);
    return ApiResponse.successWithData(
      'Data dashboard berhasil diambil',
      result,
    );
  }

  @Get('admin')
  @HasRoles('admin')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async dashboardAdmin() {
    const result = await this.dashboardService.dashboardAdmin();
    return ApiResponse.successWithData(
      'Data dashboard berhasil diambil',
      result,
    );
  }
}
