import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { PemilikTokoService } from './pemilik-toko.service';
import { CreatePemilikTokoDto } from './dto/create-pemilik-toko.dto';
import { UpdatePemilikTokoDto } from './dto/update-pemilik-toko.dto';
import { ApiResponse } from '@/common/helpers/api-response.helper';
import { QueryPemilikTokoDto } from './dto/query-pemilik-toko.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes } from '@nestjs/swagger';
import { FileUploadService } from '@/common/services/file-upload.services';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';

@Controller('api/pemilik-toko')
export class PemilikTokoController {
  constructor(private readonly pemilikTokoService: PemilikTokoService) {}

  @Post()
  async create(@Body() createPemilikTokoDto: CreatePemilikTokoDto) {
    const result = await this.pemilikTokoService.create(createPemilikTokoDto);
    return ApiResponse.success(result.message);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Query() query: QueryPemilikTokoDto, @Req() req: any) {
    const result = await this.pemilikTokoService.findAll(query, req.user);
    return ApiResponse.successWithPaginate(
      'Data pemilik toko berhasil diambil',
      result.data,
      result.meta,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.pemilikTokoService.findOne(+id);
    return ApiResponse.successWithData(
      'Data pemilik toko berhasil diambil',
      data,
    );
  }

  @Patch(':id')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor(
      'photo',
      new FileUploadService().getImageUploadOptions('pemilik-toko'),
    ),
  )
  async update(
    @Param('id') id: string,
    @Body() updatePemilikTokoDto: UpdatePemilikTokoDto,
    @UploadedFile() photo?: Express.Multer.File,
  ) {
    await this.pemilikTokoService.update(+id, updatePemilikTokoDto, photo);
    return ApiResponse.success('Data pemilik toko berhasil diperbarui');
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.pemilikTokoService.remove(+id);
    return ApiResponse.success('Data pemilik toko berhasil dihapus');
  }
}
