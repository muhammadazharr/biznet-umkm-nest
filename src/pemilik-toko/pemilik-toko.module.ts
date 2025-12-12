import { Module } from '@nestjs/common';
import { PemilikTokoService } from './pemilik-toko.service';
import { PemilikTokoController } from './pemilik-toko.controller';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PemilikTokoController],
  providers: [PemilikTokoService],
})
export class PemilikTokoModule {}
