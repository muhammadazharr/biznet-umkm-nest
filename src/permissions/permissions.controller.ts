import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { ApiResponse } from '@/common/helpers/api-response.helper';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('api/permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @Post()
  async create(@Body() createPermissionDto: CreatePermissionDto) {
    await this.permissionsService.create(createPermissionDto);
    return ApiResponse.success('Permission berhasil dibuat');
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @Get()
  async findAll(@Query() query: PaginationQueryDto) {
    const result = await this.permissionsService.findAll(query);
    return ApiResponse.successWithPaginate(
      'Data permission berhasil diambil',
      result.data,
      result.meta,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const result = await this.permissionsService.findOne(+id);
    return ApiResponse.successWithData(
      'Data permission berhasil diambil',
      result,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    await this.permissionsService.update(+id, updatePermissionDto);
    return ApiResponse.success('Data permission berhasil diperbarui');
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.permissionsService.remove(+id);
    return ApiResponse.success('Data permission berhasil dihapus');
  }
}
