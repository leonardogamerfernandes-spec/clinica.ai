import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AppointmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.appointment.findMany({
      where: { tenantId },
      include: {
        patient: true,
        doctor: true,
      },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  async create(tenantId: string, data: { patientName: string; phone: string; scheduledAt: string; procedure?: string; doctorId?: string }) {
    // Fail-safe patient resolution: find by phone or create new within this tenant
    let patient = await this.prisma.patient.findFirst({
      where: {
        tenantId,
        phone: data.phone,
      },
    });

    if (!patient) {
      patient = await this.prisma.patient.create({
        data: {
          tenantId,
          name: data.patientName,
          phone: data.phone,
          notes: 'Criado automaticamente via agendamento',
        },
      });
    }

    if (data.doctorId) {
      const doctor = await this.prisma.user.findFirst({
        where: { id: data.doctorId, tenantId },
      });
      if (!doctor) {
        throw new NotFoundException('Doutor não cadastrado nesta clínica.');
      }
    }

    return this.prisma.appointment.create({
      data: {
        tenantId,
        patientId: patient.id,
        doctorId: data.doctorId || null,
        scheduledAt: new Date(data.scheduledAt),
        status: 'PENDING',
        procedure: data.procedure || 'Consulta Geral',
      },
      include: {
        patient: true,
        doctor: true,
      },
    });
  }

  async updateStatus(tenantId: string, id: string, status: string) {
    const appointment = await this.prisma.appointment.findFirst({
      where: { id, tenantId },
    });

    if (!appointment) {
      throw new NotFoundException('Agendamento não encontrado para esta clínica.');
    }

    return this.prisma.appointment.update({
      where: { id },
      data: { status },
      include: {
        patient: true,
        doctor: true,
      },
    });
  }
}
