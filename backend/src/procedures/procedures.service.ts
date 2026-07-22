import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProceduresService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string) {
    let list = await this.prisma.procedure.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' },
    });

    // Auto-seed default procedures if list is empty for this tenant
    if (list.length === 0) {
      await this.prisma.procedure.createMany({
        data: [
          { tenantId, name: 'Avaliação', price: 100.0, duration: 30 },
          { tenantId, name: 'Limpeza', price: 150.0, duration: 45 },
          { tenantId, name: 'Clareamento', price: 600.0, duration: 60 },
          { tenantId, name: 'Canal', price: 800.0, duration: 90 },
          { tenantId, name: 'Ortodontia', price: 120.0, duration: 30 },
        ],
      });
      list = await this.prisma.procedure.findMany({
        where: { tenantId },
        orderBy: { name: 'asc' },
      });
    }

    return list;
  }

  async create(tenantId: string, data: { name: string; price: number; duration: number }) {
    return this.prisma.procedure.create({
      data: {
        tenantId,
        name: data.name,
        price: data.price,
        duration: data.duration,
      },
    });
  }
}
