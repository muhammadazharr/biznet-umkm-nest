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
import { SosialMediaService } from './sosial-media.service';
import { CreateSosialMediaDto } from './dto/create-sosial-media.dto';
import { UpdateSosialMediaDto } from './dto/update-sosial-media.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ApiResponse } from '@/common/helpers/api-response.helper';
import { SosialMediaQueryDto } from './dto/query-sosial-media.dto';
import { Public } from '@/auth/decorators/public.decorator';

@Controller('api/sosial-media')
export class SosialMediaController {
  constructor(private readonly sosialMediaService: SosialMediaService) {}

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @Post()
  async create(@Body() createSosialMediaDto: CreateSosialMediaDto, @Req() req: any) {
    await this.sosialMediaService.create(createSosialMediaDto, req.user);
    return ApiResponse.success('sosial media berhasil dibuat');
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @Get()
  async findAll(@Query() query: SosialMediaQueryDto, @Req() req: any) {
    const result = await this.sosialMediaService.findAll(query, req.user);
    return ApiResponse.successWithPaginate(
      'Data sosial media berhasil diambil',
      result.data,
      result.meta,
    );
  }

  @Get('landing')
  @Public()
  async landing(@Query() query: SosialMediaQueryDto) {
    const result = await this.sosialMediaService.landing(query);
    return ApiResponse.successWithData(
      'Data sosial media berhasil diambil',
      result,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any) {
    const result = await this.sosialMediaService.findOne(+id, req.user);
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
    @Req() req: any,
  ) {
    await this.sosialMediaService.update(+id, updateSosialMediaDto, req.user);
    return ApiResponse.success('Data sosial media berhasil diperbarui');
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    await this.sosialMediaService.remove(+id, req.user);
    return ApiResponse.success('Data sosial media berhasil dihapus');
  }
}

