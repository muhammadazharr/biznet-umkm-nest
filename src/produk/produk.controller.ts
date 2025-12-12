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
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ProdukService } from './produk.service';
import { CreateProdukDto } from './dto/create-produk.dto';
import { UpdateProdukDto } from './dto/update-produk.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ApiResponse } from '@/common/helpers/api-response.helper';
import { QueryProdukDto } from './dto/query-produk.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileUploadService } from '@/common/services/file-upload.services';
import { Public } from '@/auth/decorators/public.decorator';

@Controller('api/produk')
export class ProdukController {
  constructor(private readonly produkService: ProdukService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(
    FileInterceptor(
      'thumbnail',
      new FileUploadService().getImageUploadOptions('produk'),
    ),
  )
  async create(
    @Body() createProdukDto: CreateProdukDto,
    @UploadedFile() thumbnail: Express.Multer.File,
  ) {
    await this.produkService.create(createProdukDto, thumbnail);
    return ApiResponse.success('Produk berhasil dibuat');
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async findAll(@Query() query: QueryProdukDto) {
    const result = await this.produkService.findAll(query);
    return ApiResponse.successWithPaginate(
      'Data Produk berhasil diambil',
      result.data,
      result.meta,
    );
  }

  @Get('landing')
  @Public()
  async landing(@Query() query: QueryProdukDto) {
    const result = await this.produkService.landing(query);
    return ApiResponse.successWithPaginate(
      'Data Produk berhasil diambil',
      result.data,
      result.meta,
    );
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async findOne(@Param('id') id: string) {
    const result = await this.produkService.findOne(+id);
    return ApiResponse.successWithData('Data Produk berhasil diambil', result);
  }

  @Get('landing/:slug')
  @Public()
  async landingProfile(@Param('slug') slug: string) {
    const result = await this.produkService.landingProfile(slug);
    return ApiResponse.successWithData('Data Produk berhasil diambil', result);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(
    FileInterceptor(
      'thumbnail',
      new FileUploadService().getImageUploadOptions('produk'),
    ),
  )
  async update(
    @Param('id') id: string,
    @Body() updateProdukDto: UpdateProdukDto,
    @UploadedFile() thumbnail: Express.Multer.File,
  ) {
    await this.produkService.update(+id, updateProdukDto, thumbnail);
    return ApiResponse.success('Data Produk berhasil diperbarui');
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async remove(@Param('id') id: string) {
    await this.produkService.remove(+id);
    return ApiResponse.success('Data Produk berhasil dihapus');
  }
}
