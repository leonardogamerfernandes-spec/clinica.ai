import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';

@Injectable()
export class PublicService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly whatsappService: WhatsappService,
  ) {}

  async getClinicDetails(clinicId: string) {
    const clinic = await this.prisma.tenant.findUnique({
      where: { id: clinicId },
      include: {
        procedures: true,
        users: {
          where: {
            OR: [
              { role: 'DOCTOR' },
              { name: { startsWith: 'Dr' } },
            ],
          },
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });

    if (!clinic) {
      throw new NotFoundException('Clínica não encontrada.');
    }

    return {
      name: clinic.name,
      procedures: clinic.procedures,
      doctors: clinic.users,
    };
  }

  async bookAppointment(clinicId: string, data: { patientName: string; phone: string; doctorId: string; procedureId: string; scheduledAt: string }) {
    // 1. Find or create patient
    let patient = await this.prisma.patient.findFirst({
      where: {
        tenantId: clinicId,
        phone: data.phone,
      },
    });

    if (!patient) {
      patient = await this.prisma.patient.create({
        data: {
          tenantId: clinicId,
          name: data.patientName,
          phone: data.phone,
          notes: 'Cadastrado via Portal de Agendamento Online',
        },
      });
    }

    const procedure = await this.prisma.procedure.findFirst({
      where: { id: data.procedureId, tenantId: clinicId },
    });
    if (!procedure) {
      throw new NotFoundException('Procedimento inválido ou não disponível para esta clínica.');
    }

    const doctor = await this.prisma.user.findFirst({
      where: { id: data.doctorId, tenantId: clinicId },
    });
    if (!doctor) {
      throw new NotFoundException('Médico selecionado não pertence a esta clínica.');
    }

    // 2. Create the appointment
    const appointment = await this.prisma.appointment.create({
      data: {
        tenantId: clinicId,
        patientId: patient.id,
        doctorId: data.doctorId,
        procedureId: data.procedureId,
        procedure: procedure?.name || 'Consulta Geral',
        scheduledAt: new Date(data.scheduledAt),
        status: 'PENDING',
      },
      include: {
        patient: true,
        doctor: true,
        procedureRelation: true,
      },
    });

    // 3. Trigger WhatsApp reminder message
    const formattedDate = new Date(data.scheduledAt).toLocaleDateString('pt-BR');
    const formattedTime = new Date(data.scheduledAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    
    const docName = doctor?.name || 'seu Doutor';
    const procName = procedure?.name || 'Consulta Geral';
    
    const reminderText = `Olá, ${data.patientName}! Recebemos sua solicitação de agendamento no Portal Online para o dia ${formattedDate} às ${formattedTime} com ${docName} para o procedimento: ${procName}. Por favor, responda "Sim" para confirmar ou "Não" para reagendar.`;

    // Save outgoing message log
    await this.prisma.whatsAppMessage.create({
      data: {
        tenantId: clinicId,
        patientId: patient.id,
        direction: 'OUTGOING',
        content: reminderText,
      },
    });

    // Send real message asynchronously
    this.whatsappService.sendRealWhatsApp(data.phone, reminderText).catch(() => {});

    return appointment;
  }
}
