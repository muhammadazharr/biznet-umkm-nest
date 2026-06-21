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
  Req,
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
  async create(@Body() createCabangDto: CreateCabangDto, @Req() req: any) {
    await this.cabangService.create(createCabangDto, req.user);
    return ApiResponse.success('Cabang berhasil dibuat');
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async findAll(@Query() query: CabangQueryDto, @Req() req: any) {
    const result = await this.cabangService.findAll(query, req.user);
    return ApiResponse.successWithPaginate(
      'Data Cabang berhasil diambil',
      result.data,
      result.meta,
    );
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async findOne(@Param('id') id: string, @Req() req: any) {
    const result = await this.cabangService.findOne(+id, req.user);
    return ApiResponse.successWithData('Data Cabang berhasil diambil', result);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async update(
    @Param('id') id: string,
    @Body() updateCabangDto: UpdateCabangDto,
    @Req() req: any,
  ) {
    await this.cabangService.update(+id, updateCabangDto, req.user);
    return ApiResponse.success('Data Cabang berhasil diperbarui');
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async remove(@Param('id') id: string, @Req() req: any) {
    await this.cabangService.remove(+id, req.user);
    return ApiResponse.success('Data Cabang berhasil dihapus');
  }
}

