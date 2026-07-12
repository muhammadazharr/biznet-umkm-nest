import { Controller, Get, Post, Body, Patch, Param, Delete, Ip, Headers } from '@nestjs/common';
import { KeranjangService } from './keranjang.service';
import { CreateKeranjangDto } from './dto/create-keranjang.dto';
import { UpdateKeranjangDto } from './dto/update-keranjang.dto';
import { Public } from '@/auth/decorators/public.decorator';

@Controller('api/keranjang')
export class KeranjangController {
  constructor(private readonly keranjangService: KeranjangService) {}

  @Public()
  @Post()
  create(
    @Body() createKeranjangDto: CreateKeranjangDto,
    @Ip() ip: string,
    @Headers('x-cart-token') token: string
  ) {
    return this.keranjangService.create(createKeranjangDto, ip, token);
  }

  @Public()
  @Get()
  findAll(@Headers('x-cart-token') token: string) {
    return this.keranjangService.findAll(token);
  }

  @Patch(':id')
  update(
    @Param('id') id: string, 
    @Body() updateKeranjangDto: UpdateKeranjangDto,
    @Headers('x-cart-token') token: string
  ) {
    return this.keranjangService.update(+id, updateKeranjangDto, token);
  }

  @Public()
  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Headers('x-cart-token') token: string
  ) {
    return this.keranjangService.remove(+id, token);
  }
}
