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
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ApiResponse } from '@/common/helpers/api-response.helper';
import { RolesQueryDto } from './dto/roles-query.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('api/roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @Post()
  async create(@Body() createRoleDto: CreateRoleDto) {
    await this.rolesService.create(createRoleDto);
    return ApiResponse.success('Role berhasil dibuat');
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @Get()
  async findAll(@Query() query: RolesQueryDto) {
    const result = await this.rolesService.findAll(query);
    return ApiResponse.successWithPaginate(
      'Data role berhasil diambil',
      result.data,
      result.meta,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const result = await this.rolesService.findOne(+id);
    return ApiResponse.successWithData('Data role berhasil diambil', result);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    await this.rolesService.update(+id, updateRoleDto);
    return ApiResponse.success('Data role berhasil diperbarui');
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.rolesService.remove(+id);
    return ApiResponse.success('Data role berhasil dihapus');
  }
}
