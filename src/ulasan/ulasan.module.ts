import { Module } from '@nestjs/common';
import { UlasanService } from './ulasan.service';
import { UlasanController } from './ulasan.controller';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [UlasanController],
  providers: [UlasanService],
})
export class UlasanModule {}
