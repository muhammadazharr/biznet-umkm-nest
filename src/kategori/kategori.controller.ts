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
import { KategoriService } from './kategori.service';
import { CreateKategoriDto } from './dto/create-kategori.dto';
import { UpdateKategoriDto } from './dto/update-kategori.dto';
import { ApiResponse } from '@/common/helpers/api-response.helper';
import { KategoriQueryDto } from './dto/kategori-query.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Public } from '@/auth/decorators/public.decorator';

@Controller('api/kategori')
export class KategoriController {
  constructor(private readonly kategoriService: KategoriService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async create(@Body() createKategoriDto: CreateKategoriDto) {
    await this.kategoriService.create(createKategoriDto);
    return ApiResponse.success('Kategori berhasil dibuat');
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async findAll(@Query() query: KategoriQueryDto) {
    const result = await this.kategoriService.findAll(query);
    return ApiResponse.successWithPaginate(
      'Data Kategori berhasil diambil',
      result.data,
      result.meta,
    );
  }

  @Get('landing')
  @Public()
  async landing(@Query() query: KategoriQueryDto) {
    const result = await this.kategoriService.landing(query);
    return ApiResponse.successWithData(
      'Data Kategori berhasil diambil',
      result,
    );
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async findOne(@Param('id') id: string) {
    const result = await this.kategoriService.findOne(+id);
    return ApiResponse.successWithData(
      'Data Kategori berhasil diambil',
      result,
    );
  }

  @Get('landing/:id')
  @Public()
  async landingShow(@Param('id') id: string) {
    const result = await this.kategoriService.landingShow(+id);
    return ApiResponse.successWithData(
      'Data Kategori berhasil diambil',
      result,
    );
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async update(
    @Param('id') id: string,
    @Body() updateKategoriDto: UpdateKategoriDto,
  ) {
    await this.kategoriService.update(+id, updateKategoriDto);
    return ApiResponse.success('Data Kategori berhasil diperbarui');
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async remove(@Param('id') id: string) {
    await this.kategoriService.remove(+id);
    return ApiResponse.success('Data Kategori berhasil dihapus');
  }
}
