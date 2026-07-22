import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { WhatsappService } from '../whatsapp/whatsapp.service';

@Injectable()
export class MarketingService {
  private readonly logger = new Logger(MarketingService.name);
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
        this.logger.error('Failed to initialize Gemini in MarketingService', err);
      }
    }
  }

  async createDraft(tenantId: string, prompt: string) {
    const patients = await this.prisma.patient.findMany({
      where: { tenantId },
    });

    const drafts: Array<{ patientId: string; patientName: string; phone: string; content: string }> = [];

    for (const patient of patients) {
      let draftText = `Olá, ${patient.name}! Faz tempo que não vemos você por aqui. Temos condições especiais para o seu retorno clínico nesta semana. Quer agendar uma avaliação?`;

      if (this.genAI) {
        try {
          const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
          const aiPrompt = `Escreva uma mensagem de WhatsApp curta, persuasiva e muito simpática em português para o paciente ${patient.name}. 
          O administrador da clínica quer disparar uma campanha com o objetivo: "${prompt}".
          Histórico clínico resumido do paciente para você usar como contexto (opcional): "${patient.notes || 'Sem anotações'}"
          Não use placeholders como [Nome do Paciente], use o nome real ${patient.name}. Retorne apenas a mensagem final do WhatsApp pronta para envio.`;

          const result = await model.generateContent(aiPrompt);
          draftText = result.response.text().trim() || draftText;
        } catch (e) {
          this.logger.error(`Error generating custom marketing message for ${patient.name}`, e);
        }
      }

      drafts.push({
        patientId: patient.id,
        patientName: patient.name,
        phone: patient.phone,
        content: draftText,
      });
    }

    return {
      audienceSize: patients.length,
      drafts,
    };
  }

  async sendCampaign(
    tenantId: string,
    data: { name: string; prompt: string; drafts: Array<{ patientId: string; phone: string; content: string }> },
  ) {
    // 1. Log campaign record
    const campaign = await this.prisma.marketingCampaign.create({
      data: {
        tenantId,
        name: data.name,
        prompt: data.prompt,
        audienceSize: data.drafts.length,
        status: 'SENT',
      },
    });

    // 2. Dispatch all draft messages
    for (const draft of data.drafts) {
      await this.prisma.whatsAppMessage.create({
        data: {
          tenantId,
          patientId: draft.patientId,
          direction: 'OUTGOING',
          content: draft.content,
        },
      });

      // Send real message asynchronously
      this.whatsappService.sendRealWhatsApp(draft.phone, draft.content).catch(() => {});
    }

    return campaign;
  }
}
