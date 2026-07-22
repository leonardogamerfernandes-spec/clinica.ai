import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class PatientsService {
  private readonly logger = new Logger(PatientsService.name);
  private genAI: GoogleGenerativeAI | null = null;

  constructor(private readonly prisma: PrismaService) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        this.genAI = new GoogleGenerativeAI(apiKey);
      } catch (err) {
        this.logger.error('Failed to initialize Gemini in PatientsService', err);
      }
    }
  }

  async findAll(tenantId: string) {
    return this.prisma.patient.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(tenantId: string, data: { name: string; phone: string; notes?: string }) {
    return this.prisma.patient.create({
      data: {
        tenantId,
        name: data.name,
        phone: data.phone,
        notes: data.notes || '',
      },
    });
  }

  async getPrescriptions(tenantId: string, patientId: string) {
    return this.prisma.prescription.findMany({
      where: { tenantId, patientId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createPrescription(tenantId: string, patientId: string, data: { medicines: string; instructions: string }) {
    const patient = await this.prisma.patient.findFirst({
      where: { id: patientId, tenantId },
    });
    if (!patient) {
      throw new NotFoundException('Paciente não encontrado para esta clínica.');
    }

    return this.prisma.prescription.create({
      data: {
        tenantId,
        patientId,
        medicines: data.medicines,
        instructions: data.instructions,
      },
    });
  }

  async generateAiPrescription(tenantId: string, patientId: string, symptoms: string) {
    const patient = await this.prisma.patient.findFirst({
      where: { id: patientId, tenantId },
    });

    const fallback = {
      medicines: 'Ibuprofeno 600mg\nParacetamol 500mg',
      instructions: 'Ibuprofeno: Tomar 1 comprimido a cada 12 horas em caso de dor ou inflamação.\nParacetamol: Tomar 1 comprimido a cada 8 horas se houver febre ou dor leve.',
    };

    if (!patient) return fallback;

    if (!this.genAI) {
      this.logger.debug('Gemini key not set, returning fallback simulation.');
      return fallback;
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const prompt = `Você é um assistente odontológico/clínico inteligente. O paciente ${patient.name} apresenta os seguintes sintomas/quadro clínico: "${symptoms}".
      Escreva uma sugestão de receita de medicamentos e orientações de posologia adequadas.
      Retorne obrigatoriamente um objeto JSON com os seguintes campos (sem tags markdown, apenas o JSON bruto):
      {
        "medicines": "Lista de medicamentos sugeridos (um por linha)",
        "instructions": "Posologia e orientações de uso detalhadas"
      }
      `;

      const result = await model.generateContent(prompt);
      const rawText = result.response.text().trim();
      const cleanJson = rawText.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
      return JSON.parse(cleanJson);
    } catch (e) {
      this.logger.error('Error generating prescription via Gemini API', e);
      return fallback;
    }
  }

  async getTeethTreatments(tenantId: string, patientId: string) {
    return this.prisma.toothTreatment.findMany({
      where: { tenantId, patientId },
      orderBy: { toothNumber: 'asc' },
    });
  }

  async updateToothTreatment(
    tenantId: string,
    patientId: string,
    toothNumber: number,
    data: { condition: string; notes?: string },
  ) {
    const patient = await this.prisma.patient.findFirst({
      where: { id: patientId, tenantId },
    });
    if (!patient) {
      throw new NotFoundException('Paciente não encontrado para esta clínica.');
    }

    const existing = await this.prisma.toothTreatment.findFirst({
      where: { tenantId, patientId, toothNumber },
    });

    let record;
    if (existing) {
      record = await this.prisma.toothTreatment.update({
        where: { id: existing.id },
        data: {
          condition: data.condition,
          notes: data.notes || '',
        },
      });
    } else {
      record = await this.prisma.toothTreatment.create({
        data: {
          tenantId,
          patientId,
          toothNumber,
          condition: data.condition,
          notes: data.notes || '',
        },
      });
    }

    // Append a log note to patient EMR notes
    const conditionLabels: Record<string, string> = {
      CARIES: 'Cárie',
      CANAL: 'Tratamento de Canal',
      IMPLANT: 'Implante',
      CROWN: 'Coroa Protética',
      HEALTHY: 'Saudável',
    };

    const label = conditionLabels[data.condition] || data.condition;
    const logText = `\n[Odontograma - ${new Date().toLocaleDateString('pt-BR')}]: Dente ${toothNumber} marcado como ${label}. Obs: ${data.notes || 'Sem observações'}`;
    
    const updatedNotes = patient.notes 
      ? `${patient.notes}${logText}` 
      : logText;

    await this.prisma.patient.update({
      where: { id: patientId },
      data: {
        notes: updatedNotes,
      },
    });

    return record;
  }
}
