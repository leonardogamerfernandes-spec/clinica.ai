import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { WhatsappService } from './whatsapp.service';

@Injectable()
export class AutomationSchedulerService {
  private readonly logger = new Logger(AutomationSchedulerService.name);
  private genAI: GoogleGenerativeAI | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly whatsappService: WhatsappService,
  ) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        this.genAI = new GoogleGenerativeAI(apiKey);
      } catch (err) {
        this.logger.error('Failed to initialize Gemini in Scheduler', err);
      }
    }
  }

  // Runs every 5 minutes to scan and trigger notifications
  @Cron(CronExpression.EVERY_5_MINUTES)
  async scanAndTriggerAutomations() {
    this.logger.log('Running background scheduler: Scanning appointments for automations...');
    
    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);
    
    // 1. Target 1: Lembrete 24h (Appointments scheduled for tomorrow, status PENDING)
    const upcomingAppointments = await this.prisma.appointment.findMany({
      where: {
        scheduledAt: {
          gte: now,
          lte: tomorrow,
        },
        status: 'PENDING',
      },
      include: {
        patient: true,
        tenant: true,
      },
    });

    for (const appt of upcomingAppointments) {
      // Avoid sending duplicate reminders
      const alreadySent = await this.prisma.whatsAppMessage.findFirst({
        where: {
          patientId: appt.patientId,
          direction: 'OUTGOING',
          content: { contains: 'confirmar' },
          createdAt: {
            gte: new Date(now.getTime() - 24 * 60 * 60 * 1000), // Within last 24h
          },
        },
      });

      if (!alreadySent) {
        const text = await this.draftReminder(appt);
        await this.prisma.whatsAppMessage.create({
          data: {
            tenantId: appt.tenantId,
            patientId: appt.patientId,
            direction: 'OUTGOING',
            content: text,
          },
        });
        
        // Trigger real message send via WhatsApp service
        this.whatsappService.sendRealWhatsApp(appt.patient.phone, text).catch(() => {});

        this.logger.log(`24h Reminder sent automatically to ${appt.patient.name} (${appt.patient.phone})`);
      }
    }

    // 2. Target 2: No-Show Mitigation (Appointments in past 2 hours, status PENDING/unconfirmed)
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    const missedAppointments = await this.prisma.appointment.findMany({
      where: {
        scheduledAt: {
          lte: twoHoursAgo,
        },
        status: 'PENDING',
      },
      include: {
        patient: true,
        tenant: true,
      },
    });

    for (const appt of missedAppointments) {
      const alreadyMitigated = await this.prisma.whatsAppMessage.findFirst({
        where: {
          patientId: appt.patientId,
          direction: 'OUTGOING',
          content: { contains: 'sentimos sua falta' },
          createdAt: {
            gte: appt.scheduledAt,
          },
        },
      });

      if (!alreadyMitigated) {
        const text = await this.draftNoShow(appt);
        await this.prisma.whatsAppMessage.create({
          data: {
            tenantId: appt.tenantId,
            patientId: appt.patientId,
            direction: 'OUTGOING',
            content: text,
          },
        });
        
        // Trigger real message send via WhatsApp service
        this.whatsappService.sendRealWhatsApp(appt.patient.phone, text).catch(() => {});

        // Mark status as CANCELED or leave pending for CRM task
        await this.prisma.appointment.update({
          where: { id: appt.id },
          data: { status: 'CANCELED' },
        });

        this.logger.log(`No-show mitigation WhatsApp triggered automatically for ${appt.patient.name}`);
      }
    }
  }

  private async draftReminder(appt: any): Promise<string> {
    const formattedDate = appt.scheduledAt.toLocaleDateString('pt-BR');
    const formattedTime = appt.scheduledAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const fallbackMsg = `Olá, ${appt.patient.name}! Lembramos da sua consulta marcada para amanhã (${formattedDate}) às ${formattedTime}. Por favor, responda "Sim" para confirmar ou "Não" caso precise reagendar.`;

    if (!this.genAI) return fallbackMsg;

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const prompt = `Escreva uma mensagem de lembrete de WhatsApp curta e muito simpática em português para o paciente ${appt.patient.name}. 
      Ele tem uma consulta marcada na clínica ${appt.tenant.name} no dia ${formattedDate} às ${formattedTime} para o procedimento ${appt.procedure || 'Geral'}.
      Peça educadamente para ele responder SIM para confirmar ou NÃO caso precise reagendar.
      Retorne apenas o texto da mensagem.`;
      
      const result = await model.generateContent(prompt);
      return result.response.text().trim() || fallbackMsg;
    } catch {
      return fallbackMsg;
    }
  }

  private async draftNoShow(appt: any): Promise<string> {
    const fallbackMsg = `Olá, ${appt.patient.name}. Sentimos sua falta em nossa consulta hoje! Se quiser remarcar para outra data de forma rápida, basta responder com o dia e horário que prefere.`;

    if (!this.genAI) return fallbackMsg;

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const prompt = `Escreva uma mensagem de WhatsApp muito simpática em português para o paciente ${appt.patient.name} que acabou de faltar a uma consulta (no-show) na clínica ${appt.tenant.name}.
      Diga que sentimos falta dele e que ele pode responder diretamente com o melhor horário para reagendar de forma rápida.
      Retorne apenas o texto da mensagem.`;
      
      const result = await model.generateContent(prompt);
      return result.response.text().trim() || fallbackMsg;
    } catch {
      return fallbackMsg;
    }
  }
}
