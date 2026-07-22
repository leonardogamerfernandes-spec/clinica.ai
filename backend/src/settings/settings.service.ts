import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getInventory(tenantId: string) {
    let items = await this.prisma.inventoryItem.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' },
    });

    // Auto-seed default items if database is empty for this tenant
    if (items.length === 0) {
      await this.prisma.inventoryItem.createMany({
        data: [
          { tenantId, code: 'AN-209', name: 'Anestésico Mepivacaína 2%', qty: '12 caixas', expiry: '12 Out 2026', supplier: 'Dental Cremer', status: 'ok' },
          { tenantId, code: 'RE-591', name: 'Resina Composta Z350 3M', qty: '3 bisnagas', expiry: '05 Ago 2026', supplier: 'Dental Gold', status: 'critical' },
          { tenantId, code: 'LV-102', name: 'Luva Látex Supermax (M)', qty: '1 caixa', expiry: '20 Dez 2026', supplier: 'Dental Cremer', status: 'low' },
          { tenantId, code: 'AL-774', name: 'Álcool em Gel 70% 1L', qty: '8 frascos', expiry: '14 Jan 2027', supplier: 'Med Clean', status: 'ok' },
        ],
      });
      items = await this.prisma.inventoryItem.findMany({
        where: { tenantId },
        orderBy: { name: 'asc' },
      });
    }

    return items;
  }

  async createInventory(tenantId: string, data: { name: string; code: string; qty: string; expiry: string; supplier: string; status: string }) {
    return this.prisma.inventoryItem.create({
      data: {
        tenantId,
        name: data.name,
        code: data.code,
        qty: data.qty,
        expiry: data.expiry,
        supplier: data.supplier,
        status: data.status,
      },
    });
  }

  async getStaff(tenantId: string) {
    let staff = await this.prisma.staffPerformance.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' },
    });

    // Auto-seed default staff performance if database is empty for this tenant
    if (staff.length === 0) {
      await this.prisma.staffPerformance.createMany({
        data: [
          { tenantId, name: 'Dr. Leonardo', role: 'Dentista / Cirurgião', appointmentsCount: 142, efficiency: '96%', billing: 'R$ 56.000,00', commission: 'R$ 16.800,00' },
          { tenantId, name: 'Dra. Mariana', role: 'Ortodontista', appointmentsCount: 98, efficiency: '92%', billing: 'R$ 42.000,00', commission: 'R$ 12.600,00' },
          { tenantId, name: 'Clara Reis', role: 'Recepção / Secretária', appointmentsCount: 240, efficiency: '98%', billing: 'N/A', commission: 'R$ 1.500,00 (Bônus)' },
        ],
      });
      staff = await this.prisma.staffPerformance.findMany({
        where: { tenantId },
        orderBy: { name: 'asc' },
      });
    }

    return staff;
  }

  async getBranches(tenantId: string) {
    let branches = await this.prisma.branchUnit.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' },
    });

    // Auto-seed default branches if database is empty for this tenant
    if (branches.length === 0) {
      await this.prisma.branchUnit.createMany({
        data: [
          { tenantId, name: 'Unidade Jardins (Matriz)', billing: 'R$ 148.500,00', patientsCount: 1420, occupationRate: '94%', noShows: '4%' },
          { tenantId, name: 'Unidade Centro (Filial)', billing: 'R$ 92.400,00', patientsCount: 890, occupationRate: '78%', noShows: '12%' },
        ],
      });
      branches = await this.prisma.branchUnit.findMany({
        where: { tenantId },
        orderBy: { name: 'asc' },
      });
    }

    return branches;
  }
}
