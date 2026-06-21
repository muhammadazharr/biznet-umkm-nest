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
import { FaqService } from './faq.service';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ApiResponse } from '@/common/helpers/api-response.helper';
import { QueryFaqDto } from './dto/query-faq.dto';
import { Public } from '@/auth/decorators/public.decorator';

@Controller('api/faq')
export class FaqController {
  constructor(private readonly faqService: FaqService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async create(@Body() createFaqDto: CreateFaqDto, @Req() req: any) {
    await this.faqService.create(createFaqDto, req.user);
    return ApiResponse.success('Faq berhasil dibuat');
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async findAll(@Query() query: QueryFaqDto, @Req() req: any) {
    const result = await this.faqService.findAll(query, req.user);
    return ApiResponse.successWithPaginate(
      'Data Faq berhasil diambil',
      result.data,
      result.meta,
    );
  }

  @Get('landing')
  @Public()
  async landing(@Query() query: QueryFaqDto) {
    const result = await this.faqService.landing(query);
    return ApiResponse.successWithData('Data Faq berhasil diambil', result);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async findOne(@Param('id') id: string, @Req() req: any) {
    const result = await this.faqService.findOne(+id, req.user);
    return ApiResponse.successWithData('Data Faq berhasil diambil', result);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async update(
    @Param('id') id: string,
    @Body() updateFaqDto: UpdateFaqDto,
    @Req() req: any,
  ) {
    await this.faqService.update(+id, updateFaqDto, req.user);
    return ApiResponse.success('Data Faq berhasil diperbarui');
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async remove(@Param('id') id: string, @Req() req: any) {
    await this.faqService.remove(+id, req.user);
    return ApiResponse.success('Data Faq berhasil dihapus');
  }
}

