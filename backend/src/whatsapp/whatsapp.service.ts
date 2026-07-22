import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GoogleGenerativeAI } from '@google/generative-ai';

// In-memory instance status map for tenants in sandbox mode
const instanceStatusMap = new Map<string, { status: 'CONNECTED' | 'QR_CODE' | 'DISCONNECTED'; phone?: string; qrCode?: string }>();

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);
  private genAI: GoogleGenerativeAI | null = null;

  constructor(private readonly prisma: PrismaService) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        this.genAI = new GoogleGenerativeAI(apiKey);
      } catch (err) {
        this.logger.error('Failed to initialize Gemini in WhatsappService', err);
      }
    }
  }

  private isMockMode(): boolean {
    return this.genAI === null;
  }

  async getMessages(tenantId: string) {
    return this.prisma.whatsAppMessage.findMany({
      where: { tenantId },
      include: {
        patient: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getConnectionStatus(tenantId: string) {
    const gatewayUrl = process.env.WHATSAPP_GATEWAY_URL;
    const gatewayApiKey = process.env.WHATSAPP_API_KEY;

    // 1. Real Gateway call if configured
    if (gatewayUrl && gatewayApiKey) {
      try {
        const response = await fetch(`${gatewayUrl}/instance/connect/${tenantId}`, {
          headers: { 'apikey': gatewayApiKey },
        });
        if (response.ok) {
          const data = await response.json();
          return {
            status: data.instance?.state === 'open' ? 'CONNECTED' : 'QR_CODE',
            qrCode: data.qrcode?.base64 || data.code || null,
            phoneNumber: data.instance?.owner || null,
            mode: 'gateway_live',
          };
        }
      } catch (err) {
        this.logger.error('Error fetching status from real gateway', err);
      }
    }

    // 2. Dev Sandbox QR Code generator simulation
    let current = instanceStatusMap.get(tenantId);
    if (!current) {
      // SVG QR Code representation data
      const mockQrSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="%23ffffff"/><rect x="20" y="20" width="50" height="50" fill="%23000000"/><rect x="30" y="30" width="30" height="30" fill="%23ffffff"/><rect x="35" y="35" width="20" height="20" fill="%238b5cf6"/><rect x="130" y="20" width="50" height="50" fill="%23000000"/><rect x="140" y="30" width="30" height="30" fill="%23ffffff"/><rect x="145" y="35" width="20" height="20" fill="%238b5cf6"/><rect x="20" y="130" width="50" height="50" fill="%23000000"/><rect x="30" y="140" width="30" height="30" fill="%23ffffff"/><rect x="35" y="145" width="20" height="20" fill="%238b5cf6"/><circle cx="100" cy="100" r="15" fill="%238b5cf6"/><rect x="80" y="30" width="20" height="20" fill="%23000000"/><rect x="100" y="60" width="20" height="40" fill="%23000000"/><rect x="140" y="120" width="40" height="40" fill="%23000000"/></svg>`;
      
      current = {
        status: 'QR_CODE',
        qrCode: mockQrSvg,
      };
      instanceStatusMap.set(tenantId, current);
    }

    return {
      status: current.status,
      qrCode: current.qrCode || null,
      phoneNumber: current.phone || '(11) 98765-4321',
      mode: 'simulated_sandbox',
    };
  }

  async connectInstance(tenantId: string) {
    // Pair instance in simulation mode
    instanceStatusMap.set(tenantId, {
      status: 'CONNECTED',
      phone: '+55 (11) 98765-4321',
    });
    return this.getConnectionStatus(tenantId);
  }

  async disconnectInstance(tenantId: string) {
    instanceStatusMap.delete(tenantId);
    return { status: 'DISCONNECTED', message: 'Instância desconectada com sucesso.' };
  }

  async handleIncomingWebhook(payload: any) {
    this.logger.log('Received real WhatsApp Webhook payload from Gateway');
    
    // Extract phone and text from standard Evolution API / Baileys webhook payload
    const phone = payload?.data?.key?.remoteJid?.split('@')[0] || payload?.phone || payload?.sender;
    const content = payload?.data?.message?.conversation || payload?.data?.message?.extendedTextMessage?.text || payload?.text || payload?.content;
    const tenantId = payload?.instance || payload?.tenantId;

    if (phone && content && tenantId) {
      return this.simulateReceive(tenantId, { phone, content });
    }

    return { status: 'ignored', reason: 'Missing phone, content or tenantId' };
  }

  async simulateReceive(tenantId: string, data: { phone: string; content: string }) {
    // 1. Resolve patient by phone
    let patient = await this.prisma.patient.findFirst({
      where: { tenantId, phone: data.phone },
    });

    if (!patient) {
      // Create a new patient automatically if they write to WhatsApp and don't exist
      patient = await this.prisma.patient.create({
        data: {
          tenantId,
          name: `Paciente ${data.phone.substring(data.phone.length - 4)}`,
          phone: data.phone,
          notes: 'Criado via WhatsApp',
        },
      });
    }

    // 2. Save incoming message to log
    const incomingMsg = await this.prisma.whatsAppMessage.create({
      data: {
        tenantId,
        patientId: patient.id,
        direction: 'INCOMING',
        content: data.content,
      },
      include: { patient: true },
    });

    // 3. Find active appointment for context
    const appointment = await this.prisma.appointment.findFirst({
      where: {
        tenantId,
        patientId: patient.id,
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
      orderBy: { scheduledAt: 'desc' },
    });

    const botConfig = await this.prisma.botConfig.findUnique({
      where: { tenantId },
    });

    const systemPrompt = botConfig?.systemPrompt || 'Você é uma assistente virtual de agendamentos.';
    const knowledgeBase = botConfig?.knowledgeBase || '';

    let aiReplyText = '';
    let intent = 'question';
    let newTimeStr = '';

    // 4. Run Gemini intent parsing
    if (this.isMockMode()) {
      // Simulated AI Agent reply rules
      await new Promise(resolve => setTimeout(resolve, 800));
      const contentLower = data.content.toLowerCase();

      if (contentLower.includes('sim') || contentLower.includes('confirm') || contentLower.includes('vou')) {
        intent = 'confirm';
        aiReplyText = `Maravilha, ${patient.name}! Sua consulta foi confirmada com sucesso em nossa agenda. Nos vemos em breve!`;
      } else if (contentLower.includes('nao') || contentLower.includes('não') || contentLower.includes('desist') || contentLower.includes('cancel')) {
        intent = 'cancel';
        aiReplyText = `Entendido, ${patient.name}. Cancelei seu agendamento. Se quiser remarcar, por favor me informe o dia e horário de preferência.`;
      } else if (contentLower.includes('remarc') || contentLower.includes('mudar') || contentLower.includes('alterar') || contentLower.includes('outro')) {
        intent = 'reschedule';
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(14, 0, 0, 0); // Tomorrow at 14:00
        newTimeStr = tomorrow.toISOString();
        aiReplyText = `Tudo bem, ${patient.name}! Remarquei sua consulta para amanhã às 14:00. Fica bom para você?`;
      } else {
        intent = 'question';
        aiReplyText = `Olá, ${patient.name}! Sou a assistente virtual da clínica. Posso lhe ajudar a tirar dúvidas sobre preços, confirmar ou remarcar sua consulta. O que deseja fazer?`;
      }
    } else {
      try {
        const model = this.genAI!.getGenerativeModel({ model: 'gemini-2.5-flash' });
        
        const prompt = `
${systemPrompt}

Base de Conhecimento:
${knowledgeBase}

Contexto do Paciente:
- Nome: ${patient.name}
- Telefone: ${patient.phone}
${appointment ? `- Consulta marcada para: ${appointment.scheduledAt.toISOString()} (ID: ${appointment.id}, Status: ${appointment.status}, Procedimento: ${appointment.procedure})` : '- Nenhuma consulta agendada no momento.'}

Mensagem recebida do paciente: "${data.content}"

Você deve processar a mensagem do paciente e retornar obrigatoriamente um objeto JSON estruturado com os seguintes campos (sem textos adicionais ou formatações markdown):
{
  "intent": "confirm" | "reschedule" | "cancel" | "question",
  "reply": "Texto de resposta simpático em português para enviar no WhatsApp",
  "newTime": "ISO String com nova data sugerida (apenas se intent for reschedule)",
  "appointmentId": "ID do agendamento afetado (se aplicável)"
}
`;

        const result = await model.generateContent(prompt);
        const rawResponse = result.response.text().trim();
        const jsonString = rawResponse.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
        const parsed = JSON.parse(jsonString);

        intent = parsed.intent;
        aiReplyText = parsed.reply;
        newTimeStr = parsed.newTime;
      } catch (err) {
        this.logger.error('Error in Gemini WhatsApp simulation', err);
        aiReplyText = `Desculpe, tive um problema ao processar seu pedido. Mas vou anotar sua mensagem e pedir para a recepção entrar em contato!`;
      }
    }

    // 5. Execute DB mutations based on AI intent resolution
    if (appointment) {
      if (intent === 'confirm') {
        await this.prisma.appointment.update({
          where: { id: appointment.id },
          data: { status: 'CONFIRMED' },
        });
      } else if (intent === 'cancel') {
        await this.prisma.appointment.update({
          where: { id: appointment.id },
          data: { status: 'CANCELED' },
        });
      } else if (intent === 'reschedule' && newTimeStr) {
        await this.prisma.appointment.update({
          where: { id: appointment.id },
          data: { 
            scheduledAt: new Date(newTimeStr),
            status: 'PENDING'
          },
        });
      }
    }

    // 6. Log AI Outgoing Message
    const outgoingMsg = await this.prisma.whatsAppMessage.create({
      data: {
        tenantId,
        patientId: patient.id,
        direction: 'OUTGOING',
        content: aiReplyText,
      },
      include: { patient: true },
    });

    // Send real message asynchronously if gateway credentials are provided
    this.sendRealWhatsApp(patient.phone, aiReplyText).catch(() => {});

    return {
      incoming: incomingMsg,
      outgoing: outgoingMsg,
    };
  }

  async sendRealWhatsApp(phone: string, content: string) {
    const gatewayUrl = process.env.WHATSAPP_GATEWAY_URL;
    const gatewayApiKey = process.env.WHATSAPP_API_KEY;

    if (!gatewayUrl) {
      this.logger.debug(`[Real WhatsApp Mock] Sent to ${phone}: "${content}"`);
      return;
    }

    try {
      const cleanPhone = phone.replace(/\D/g, '');
      const payload = {
        number: cleanPhone,
        options: { delay: 1200, linkPreview: false },
        textMessage: { text: content }
      };

      await fetch(gatewayUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': gatewayApiKey || '',
        },
        body: JSON.stringify(payload),
      });
      
      this.logger.log(`WhatsApp message sent successfully to ${cleanPhone} via gateway.`);
    } catch (err) {
      this.logger.error('Error sending WhatsApp message to external gateway.', err);
    }
  }
}
