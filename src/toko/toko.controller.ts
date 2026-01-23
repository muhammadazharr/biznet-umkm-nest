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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { TokoService } from './toko.service';
import { CreateTokoDto } from './dto/create-toko.dto';
import { UpdateTokoDto } from './dto/update-toko.dto';
import { ApiResponse } from '@/common/helpers/api-response.helper';
import { UserQueryDto } from '@/users/dto/user-query.dto';
import { UpdateTokoClientDto } from './dto/update-toko-client.dto';
import { HasRoles } from '@/auth/decorators/roles.decorator';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileUploadService } from '@/common/services/file-upload.services';
import { Public } from '@/auth/decorators/public.decorator';
import { TokoQueryDto } from './dto/toko-query.dto';

@Controller('api/toko')
export class TokoController {
  constructor(private readonly tokoService: TokoService) {}

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @Post()
  async create(@Body() createTokoDto: CreateTokoDto) {
    await this.tokoService.create(createTokoDto);
    return ApiResponse.success('Toko berhasil dibuat');
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @Get()
  async findAll(@Query() query: TokoQueryDto) {
    const result = await this.tokoService.findAll(query);
    return ApiResponse.successWithPaginate(
      'Data Toko berhasil diambil',
      result.data,
      result.meta,
    );
  }

  @Get('landing')
  @Public()
  async landing(@Query() query: UserQueryDto) {
    const result = await this.tokoService.landing(query);
    return ApiResponse.successWithPaginate(
      'Data Toko berhasil diambil',
      result.data,
      result.meta,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const result = await this.tokoService.findOne(+id);
    return ApiResponse.successWithData('Data Toko berhasil diambil', result);
  }

  @Get('landing/:slug')
  @Public()
  async landingProfile(@Param('slug') slug: string) {
    const result = await this.tokoService.landingProfile(slug);
    return ApiResponse.successWithData('Data Toko berhasil diambil', result);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @Get(':id/client')
  async findTokoClient(@Param('id') id: string) {
    const result = await this.tokoService.findTokoClient(+id);
    return ApiResponse.successWithData('Data Toko berhasil diambil', result);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() UpdateTokoDto: UpdateTokoDto) {
    this.tokoService.update(+id, UpdateTokoDto);
    return ApiResponse.success('Data berhasil diperbarui');
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @HasRoles('client')
  @Patch(':id/client')
  @UseInterceptors(
    FileInterceptor(
      'logo',
      new FileUploadService().getImageUploadOptions('logo-toko'),
    ),
  )
  async updateClient(
    @Param('id') id: string,
    @Body() UpdateTokoDto: UpdateTokoClientDto,
    @UploadedFile() logo?: Express.Multer.File,
  ) {
    this.tokoService.updateClient(+id, UpdateTokoDto, logo);
    return ApiResponse.success('Data berhasil diperbarui');
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    this.tokoService.remove(+id);
    return ApiResponse.success('Data toko berhasil dihapus');
  }
}
