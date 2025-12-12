import { Module } from '@nestjs/common';
import { PendaftarService } from './pendaftar.service';
import { PendaftarController } from './pendaftar.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { EmailModule } from '@/email/email.module';

@Module({
  imports: [EmailModule, PrismaModule],
  controllers: [PendaftarController],
  providers: [PendaftarService],
})
export class PendaftarModule {}
