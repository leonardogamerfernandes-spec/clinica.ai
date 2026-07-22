import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { PatientsController } from './patients/patients.controller';
import { PatientsService } from './patients/patients.service';
import { AppointmentsController } from './appointments/appointments.controller';
import { AppointmentsService } from './appointments/appointments.service';
import { AppointmentsSchedulerService } from './appointments/appointments-scheduler.service';
import { AuthModule } from './auth/auth.module';
import { AiModule } from './ai/ai.module';
import { WhatsappModule } from './whatsapp/whatsapp.module';
import { SettingsModule } from './settings/settings.module';
import { BillingModule } from './billing/billing.module';
import { WaitlistModule } from './waitlist/waitlist.module';
import { ProceduresModule } from './procedures/procedures.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { PublicModule } from './public/public.module';
import { MarketingModule } from './marketing/marketing.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    AuthModule,
    AiModule,
    WhatsappModule,
    SettingsModule,
    BillingModule,
    WaitlistModule,
    ProceduresModule,
    AnalyticsModule,
    PublicModule,
    MarketingModule,
  ],
  controllers: [AppController, PatientsController, AppointmentsController],
  providers: [AppService, PrismaService, PatientsService, AppointmentsService, AppointmentsSchedulerService],
})
export class AppModule {}
