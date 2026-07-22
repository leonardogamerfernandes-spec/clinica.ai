import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';

@Injectable()
export class AppointmentsSchedulerService {
  private readonly logger = new Logger(AppointmentsSchedulerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly whatsappService: WhatsappService,
  ) {}

  // Run automatically every day at 08:00 AM
  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async handleDailyReminders() {
    this.logger.log('Executing automated daily appointment reminders Cron job...');
    await this.triggerManualReminders();
  }

  async triggerManualReminders(tenantId?: string) {
    const now = new Date();
    const tomorrowEnd = new Date();
    tomorrowEnd.setDate(now.getDate() + 2);

    const whereClause: any = {
      status: 'PENDING',
      scheduledAt: {
        gte: now,
        lte: tomorrowEnd,
      },
    };

    if (tenantId) {
      whereClause.tenantId = tenantId;
    }

    const upcomingAppointments = await this.prisma.appointment.findMany({
      where: whereClause,
      include: {
        patient: true,
        tenant: true,
      },
    });

    this.logger.log(`Found ${upcomingAppointments.length} pending appointments for reminders.`);

    let sentCount = 0;
    for (const appt of upcomingAppointments) {
      if (!appt.patient?.phone) continue;

      const dateStr = new Date(appt.scheduledAt).toLocaleDateString('pt-BR');
      const timeStr = new Date(appt.scheduledAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      const procedureStr = appt.procedure || 'Consulta';

      const reminderText = `Olá, ${appt.patient.name}! 🏥 Passando para confirmar sua consulta de ${procedureStr} agendada para ${dateStr} às ${timeStr}.\n\nPor favor, responda *SIM* para confirmar sua presença ou *REMARCAR* se precisar de outro horário.`;

      // Log outgoing WhatsApp message
      await this.prisma.whatsAppMessage.create({
        data: {
          tenantId: appt.tenantId,
          patientId: appt.patientId,
          direction: 'OUTGOING',
          content: reminderText,
        },
      });

      // Dispatch to real gateway if credentials are available
      await this.whatsappService.sendRealWhatsApp(appt.patient.phone, reminderText);
      sentCount++;
    }

    return {
      success: true,
      processedAppointments: upcomingAppointments.length,
      remindersSent: sentCount,
      timestamp: new Date().toISOString(),
    };
  }
}
