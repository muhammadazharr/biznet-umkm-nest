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
import { PendaftarService } from './pendaftar.service';
import { CreatePendaftarDto } from './dto/create-pendaftar.dto';
import { UpdatePendaftarDto } from './dto/update-pendaftar.dto';
import { ApiResponse } from '@/common/helpers/api-response.helper';
import { PendaftarQueryDto } from './dto/query-pendaftar.dto';
import { Public } from '@/auth/decorators/public.decorator';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('api/pendaftar')
export class PendaftarController {
  constructor(private readonly pendaftarService: PendaftarService) {}

  @Public()
  @Post()
  async create(@Body() createPendaftarDto: CreatePendaftarDto) {
    const result = await this.pendaftarService.create(createPendaftarDto);
    return ApiResponse.success(result.message);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @Get()
  async findAll(@Query() query: PendaftarQueryDto) {
    const result = await this.pendaftarService.findAll(query);
    return ApiResponse.successWithPaginate(
      'Data pendaftar berhasil diambil',
      result.data,
      result.meta,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const result = await this.pendaftarService.findOne(+id);
    return ApiResponse.successWithData(
      'Data pendaftar berhasil diambil',
      result,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePendaftarDto: UpdatePendaftarDto,
  ) {
    const result = await this.pendaftarService.update(+id, updatePendaftarDto);
    return ApiResponse.success(result.message);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.pendaftarService.remove(+id);
    return ApiResponse.success('Data pendaftar berhasil dihapus');
  }
}
