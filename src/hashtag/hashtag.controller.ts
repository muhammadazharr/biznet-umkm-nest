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
import { HashtagService } from './hashtag.service';
import { CreateHashtagDto } from './dto/create-hashtag.dto';
import { UpdateHashtagDto } from './dto/update-hashtag.dto';
import { QueryHashtagDto } from './dto/query-hashtag.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ApiResponse } from '@/common/helpers/api-response.helper';

@Controller('api/hashtag')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth('JWT-auth')
export class HashtagController {
  constructor(private readonly hashtagService: HashtagService) {}

  @Post()
  async create(@Body() createHashtagDto: CreateHashtagDto) {
    const result = await this.hashtagService.create(createHashtagDto);
    return ApiResponse.successWithData('Hashtag berhasil dibuat', result);
  }

  @Get()
  async findAll(@Query() query: QueryHashtagDto) {
    const result = await this.hashtagService.findAll(query);
    return ApiResponse.successWithPaginate(
      'Data Hashtag berhasil diambil',
      result.data,
      result.meta,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const result = await this.hashtagService.findOne(+id);
    return ApiResponse.successWithData('Data Hashtag berhasil diambil', result);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateHashtagDto: UpdateHashtagDto) {
    const result = await this.hashtagService.update(+id, updateHashtagDto);
    return ApiResponse.successWithData('Data Hashtag berhasil diperbarui', result);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.hashtagService.remove(+id);
    return ApiResponse.success('Data Hashtag berhasil dihapus');
  }
}
