import { Module } from '@nestjs/common';
import { SosialMediaService } from './sosial-media.service';
import { SosialMediaController } from './sosial-media.controller';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SosialMediaController],
  providers: [SosialMediaService],
})
export class SosialMediaModule {}
