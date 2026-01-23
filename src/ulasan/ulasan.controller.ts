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
import { UlasanService } from './ulasan.service';
import { CreateUlasanDto } from './dto/create-ulasan.dto';
import { UpdateUlasanDto } from './dto/update-ulasan.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { QueryUlasanDto } from './dto/query-ulasan.dto';
import { ApiResponse } from '@/common/helpers/api-response.helper';
import { Public } from '@/auth/decorators/public.decorator';

@Controller('api/ulasan')
export class UlasanController {
  constructor(private readonly ulasanService: UlasanService) {}

  @Post()
  @Public()
  async create(@Body() createUlasanDto: CreateUlasanDto) {
    await this.ulasanService.create(createUlasanDto);
    return ApiResponse.success('ulasan berhasil dibuat');
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @Get()
  async findAll(@Query() query: QueryUlasanDto) {
    const result = await this.ulasanService.findAll(query);
    return ApiResponse.successWithPaginate(
      'Data ulasan berhasil diambil',
      result.data,
      result.meta,
    );
  }

  @Get('/landing')
  @Public()
  async landing(@Query() query: QueryUlasanDto) {
    const result = await this.ulasanService.landing(query);
    return ApiResponse.successWithPaginate(
      'Data ulasan berhasil diambil',
      result.data,
      result.meta,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const result = await this.ulasanService.findOne(+id);
    return ApiResponse.successWithData('Data ulasan berhasil diambil', result);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUlasanDto: UpdateUlasanDto,
  ) {
    await this.ulasanService.update(+id, updateUlasanDto);
    return ApiResponse.success('Data ulasan berhasil diperbarui');
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.ulasanService.remove(+id);
    return ApiResponse.success('Data ulasan berhasil dihapus');
  }
}
