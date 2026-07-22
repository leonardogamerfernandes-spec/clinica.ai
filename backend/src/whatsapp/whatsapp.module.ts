import { Module } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { WhatsappController } from './whatsapp.controller';
import { AutomationSchedulerService } from './automation-scheduler.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [WhatsappController],
  providers: [WhatsappService, AutomationSchedulerService, PrismaService],
  exports: [WhatsappService],
})
export class WhatsappModule {}
