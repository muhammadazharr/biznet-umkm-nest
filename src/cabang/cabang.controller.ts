import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { CabangService } from './cabang.service';
import { CreateCabangDto } from './dto/create-cabang.dto';
import { UpdateCabangDto } from './dto/update-cabang.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ApiResponse } from '@/common/helpers/api-response.helper';
import { CabangQueryDto } from './dto/cabang-query-dto';

@Controller('api/cabang-toko')
export class CabangController {
  constructor(private readonly cabangService: CabangService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async create(@Body() createCabangDto: CreateCabangDto) {
    await this.cabangService.create(createCabangDto);
    return ApiResponse.success('Cabang berhasil dibuat');
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async findAll(@Query() query: CabangQueryDto) {
    const result = await this.cabangService.findAll(query);
    return ApiResponse.successWithPaginate(
      'Data Cabang berhasil diambil',
      result.data,
      result.meta,
    );
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async findOne(@Param('id') id: string) {
    const result = await this.cabangService.findOne(+id);
    return ApiResponse.successWithData('Data Cabang berhasil diambil', result);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async update(
    @Param('id') id: string,
    @Body() updateCabangDto: UpdateCabangDto,
  ) {
    await this.cabangService.update(+id, updateCabangDto);
    return ApiResponse.success('Data Cabang berhasil diperbarui');
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async remove(@Param('id') id: string) {
    await this.cabangService.remove(+id);
    return ApiResponse.success('Data Cabang berhasil dihapus');
  }
}
