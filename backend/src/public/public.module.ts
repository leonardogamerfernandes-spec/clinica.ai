import { Module } from '@nestjs/common';
import { PublicService } from './public.service';
import { PublicController } from './public.controller';
import { PrismaService } from '../prisma/prisma.service';
import { WhatsappModule } from '../whatsapp/whatsapp.module';

@Module({
  imports: [WhatsappModule],
  controllers: [PublicController],
  providers: [PublicService, PrismaService],
  exports: [PublicService],
})
export class PublicModule {}
