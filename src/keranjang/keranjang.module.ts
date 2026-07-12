import { Module } from '@nestjs/common';
import { KeranjangService } from './keranjang.service';
import { KeranjangController } from './keranjang.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [KeranjangController],
  providers: [KeranjangService],
})
export class KeranjangModule {}
