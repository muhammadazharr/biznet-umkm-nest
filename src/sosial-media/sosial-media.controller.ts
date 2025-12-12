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
import { SosialMediaService } from './sosial-media.service';
import { CreateSosialMediaDto } from './dto/create-sosial-media.dto';
import { UpdateSosialMediaDto } from './dto/update-sosial-media.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ApiResponse } from '@/common/helpers/api-response.helper';
import { SosialMediaQueryDto } from './dto/query-sosial-media.dto';

@Controller('api/sosial-media')
export class SosialMediaController {
  constructor(private readonly sosialMediaService: SosialMediaService) {}

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @Post()
  async create(@Body() createSosialMediaDto: CreateSosialMediaDto) {
    await this.sosialMediaService.create(createSosialMediaDto);
    return ApiResponse.success('sosial media berhasil dibuat');
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @Get()
  async findAll(@Query() query: SosialMediaQueryDto) {
    const result = await this.sosialMediaService.findAll(query);
    return ApiResponse.successWithPaginate(
      'Data sosial media berhasil diambil',
      result.data,
      result.meta,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const result = await this.sosialMediaService.findOne(+id);
    return ApiResponse.successWithData(
      'Data sosial media berhasil diambil',
      result,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateSosialMediaDto: UpdateSosialMediaDto,
  ) {
    await this.sosialMediaService.update(+id, updateSosialMediaDto);
    return ApiResponse.success('Data sosial media berhasil diperbarui');
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.sosialMediaService.remove(+id);
    return ApiResponse.success('Data sosial media berhasil dihapus');
  }
}
