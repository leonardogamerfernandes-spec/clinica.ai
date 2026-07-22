import { Module } from '@nestjs/common';
import { WaitlistService } from './waitlist.service';
import { WaitlistController } from './waitlist.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [WaitlistController],
  providers: [WaitlistService, PrismaService],
  exports: [WaitlistService],
})
export class WaitlistModule {}
