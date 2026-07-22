import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WaitlistService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string) {
    let entries = await this.prisma.waitlistEntry.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'asc' },
    });

    // Auto-seed default entries if waitlist is empty for this tenant
    if (entries.length === 0) {
      await this.prisma.waitlistEntry.createMany({
        data: [
          { tenantId, patientName: 'Lucas Martins', phone: '(11) 98765-4321', preferredTime: '16:00', reason: 'Mora perto (2 min), aceita encaixe imediato' },
          { tenantId, patientName: 'Amanda Lima', phone: '(11) 91234-5678', preferredTime: '08:00', reason: 'Fila de espera para Dr. Leonardo' },
        ],
      });
      entries = await this.prisma.waitlistEntry.findMany({
        where: { tenantId },
        orderBy: { createdAt: 'asc' },
      });
    }

    return entries;
  }

  async create(tenantId: string, data: { patientName: string; phone: string; preferredTime: string; reason: string }) {
    return this.prisma.waitlistEntry.create({
      data: {
        tenantId,
        patientName: data.patientName,
        phone: data.phone,
        preferredTime: data.preferredTime,
        reason: data.reason,
      },
    });
  }

  async delete(tenantId: string, id: string) {
    const entry = await this.prisma.waitlistEntry.findFirst({
      where: { id, tenantId },
    });

    if (entry) {
      return this.prisma.waitlistEntry.delete({
        where: { id },
      });
    }
    return null;
  }
}
