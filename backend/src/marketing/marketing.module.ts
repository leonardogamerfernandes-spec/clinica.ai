import { Module } from '@nestjs/common';
import { MarketingService } from './marketing.service';
import { MarketingController } from './marketing.controller';
import { PrismaService } from '../prisma/prisma.service';
import { WhatsappModule } from '../whatsapp/whatsapp.module';

@Module({
  imports: [WhatsappModule],
  controllers: [MarketingController],
  providers: [MarketingService, PrismaService],
  exports: [MarketingService],
})
export class MarketingModule {}
