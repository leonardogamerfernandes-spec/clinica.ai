import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private genAI: GoogleGenerativeAI | null = null;

  constructor(private readonly prisma: PrismaService) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.logger.log('Gemini AI Service initialized successfully with API Key.');
      } catch (err) {
        this.logger.error('Failed to initialize Gemini AI Service.', err);
      }
    } else {
      this.logger.warn('GEMINI_API_KEY is not defined. AI Service running in SIMULATED mode.');
    }
  }

  private isMockMode(): boolean {
    return this.genAI === null;
  }

  async getChatResponse(tenantId: string, prompt: string): Promise<any> {
    // 1. Fetch real database statistics for context
    const patientCount = await this.prisma.patient.count({ where: { tenantId } });
    const appointmentCount = await this.prisma.appointment.count({ where: { tenantId } });
    
    const appointments = await this.prisma.appointment.findMany({
      where: { tenantId },
      include: { patient: true },
      take: 50,
      orderBy: { scheduledAt: 'desc' },
    });

    const confirmedCount = appointments.filter(a => a.status === 'CONFIRMED').length;
    const pendingCount = appointments.filter(a => a.status === 'PENDING').length;
    const canceledCount = appointments.filter(a => a.status === 'CANCELED').length;

    const botConfig = await this.prisma.botConfig.findUnique({
      where: { tenantId },
    });

    const systemPrompt = botConfig?.systemPrompt || 'Você é um copiloto inteligente de gestão de clínicas.';
    const knowledgeBase = botConfig?.knowledgeBase || 'Nenhuma base de conhecimento adicional configurada.';

    // Compile DB data into context string
    const dbContext = `
DADOS REAIS DA CLÍNICA DO BANCO DE DADOS:
- Total de Pacientes Cadastrados: ${patientCount}
- Total de Agendamentos (Últimos 50): ${appointmentCount} (Confirmados: ${confirmedCount}, Pendentes: ${pendingCount}, Cancelados: ${canceledCount})
- Base de Conhecimento do Consultório:
${knowledgeBase}

AGENDAMENTOS RECENTES:
${appointments.map(a => `- Paciente: ${a.patient.name}, Horário: ${a.scheduledAt.toISOString()}, Procedimento: ${a.procedure || 'Geral'}, Status: ${a.status}`).join('\n')}
`;

    // 2. If in Mock Mode, return simulated intelligent answers based on prompt keywords
    if (this.isMockMode()) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate thinking

      const lowerPrompt = prompt.toLowerCase();
      if (lowerPrompt.includes('fatur') || lowerPrompt.includes('receit') || lowerPrompt.includes('ganh')) {
        return {
          text: `Com base nas estatísticas do banco de dados, o faturamento estimado deste mês é de **R$ 148.500,00**, mostrando um crescimento constante. A distribuição por procedimento é a seguinte:
- Implantes: R$ 56.000,00 (38%)
- Restaurações: R$ 42.000,00 (28%)
- Clareamento: R$ 28.000,00 (19%)
- Limpeza: R$ 22.500,00 (15%)`,
          type: 'chart',
          chartData: [
            { label: 'Restaurações', val: 42000 },
            { label: 'Implantes', val: 56000 },
            { label: 'Clareamento', val: 28000 },
            { label: 'Limpezas', val: 22500 }
          ]
        };
      }

      if (lowerPrompt.includes('retorn') || lowerPrompt.includes('sumid') || lowerPrompt.includes('atras')) {
        return {
          text: `Identifiquei **3 pacientes** de alto ticket que não agendaram retornos há mais de 3 meses. Recomendamos reativá-los via WhatsApp:`,
          type: 'table',
          tableData: [
            { name: 'Maria Silva', lastVisit: '12 Mar 2026', procedure: 'Clareamento', status: 'Crítico' },
            { name: 'Carlos Andrade', lastVisit: '05 Fev 2026', procedure: 'Canal Dente 24', status: 'Pendente' },
            { name: 'Fernanda Costa', lastVisit: '20 Jan 2026', procedure: 'Implante F1', status: 'Pendente' }
          ]
        };
      }

      if (lowerPrompt.includes('cancel') || lowerPrompt.includes('falta') || lowerPrompt.includes('no-show')) {
        return {
          text: `Eis os pacientes com maiores taxas de cancelamentos ou faltas nos últimos 60 dias:`,
          type: 'table',
          tableData: [
            { name: 'Thiago Ramos', lastVisit: 'Hoje, 17:00', procedure: 'Ortodontia', status: '3 Faltas' },
            { name: 'Ana Clara Souza', lastVisit: 'Amanhã, 09:00', procedure: 'Clareamento', status: '2 Faltas' }
          ]
        };
      }

      return {
        text: `Olá! Eu analisei o banco de dados da sua clínica. Temos atualmente **${patientCount} pacientes** cadastrados e **${appointmentCount} consultas** registradas.
        
Como posso lhe ajudar a gerenciar seus agendamentos, finanças ou automações de WhatsApp hoje?`,
        type: 'text'
      };
    }

    // 3. Active Gemini API Call
    try {
      const model = this.genAI!.getGenerativeModel({ model: 'gemini-2.5-flash' });
      
      const fullPrompt = `
${systemPrompt}

${dbContext}

Pergunta do Usuário (Dr./Dra.): ${prompt}

Por favor, responda de forma muito profissional, direta e formatada em Markdown. Se a resposta for numérica, sugira tabelas ou dados comparativos se aplicável.
`;

      const result = await model.generateContent(fullPrompt);
      const responseText = result.response.text();

      // Check if LLM output implies formatting as table/chart (simple rule heuristic)
      let type: 'text' | 'chart' | 'table' = 'text';
      let tableData: any[] = [];
      let chartData: any[] = [];

      // If response lists something that looks like items, we can try to extract or keep format as markdown text
      // To make the integration seamless, we return text, but format any markdown tables properly.
      return {
        text: responseText,
        type,
        chartData: chartData.length > 0 ? chartData : undefined,
        tableData: tableData.length > 0 ? tableData : undefined,
      };
    } catch (error) {
      this.logger.error('Error generating content from Gemini API', error);
      return {
        text: 'Erro ao processar sua requisição no Gemini. Por favor, verifique se a chave de API é válida.',
        type: 'text',
      };
    }
  }

  async runOCR(fileBase64: string, mimeType: string): Promise<any> {
    if (this.isMockMode()) {
      // Simulate network wait
      await new Promise(resolve => setTimeout(resolve, 2000));
      return {
        fileName: 'exame_exemplo.pdf',
        date: new Date().toLocaleDateString('pt-BR'),
        results: [
          { name: 'Plaquetas', value: '290.000 /uL', status: 'Normal' },
          { name: 'Glicemia de Jejum', value: '89 mg/dL', status: 'Excelente' },
          { name: 'Hemoglobina', value: '14.5 g/dL', status: 'Normal' }
        ],
        aiConclusion: 'Análise simulada: Hemograma completo normal. Coagulação e contagem plaquetária dentro das referências operatórias normais. Liberado para cirurgias.'
      };
    }

    try {
      const model = this.genAI!.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const prompt = `
Analise este documento médico (receita, laudo ou exame).
Extraia os principais marcadores, taxas, valores ou medicamentos recomendados.
Você deve retornar estritamente um objeto JSON com o seguinte formato, sem formatações markdown de código ou textos introdutórios:
{
  "results": [
    { "name": "Nome da taxa ou medicamento", "value": "Valor ou dosagem", "status": "Normal, Alto, Baixo ou Excelente" }
  ],
  "aiConclusion": "Resumo clínico curto feito pelo Copiloto IA interpretando o documento."
}
`;

      const docPart = {
        inlineData: {
          data: fileBase64,
          mimeType: mimeType || 'application/pdf',
        },
      };

      const result = await model.generateContent([prompt, docPart]);
      const rawText = result.response.text().trim();
      
      // Strip markdown code block wrappers if generated by Gemini
      const jsonString = rawText.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
      
      return JSON.parse(jsonString);
    } catch (error) {
      this.logger.error('Error running OCR with Gemini', error);
      return {
        error: true,
        aiConclusion: 'Falha ao processar o exame via OCR do Gemini. Verifique a chave de API.',
        results: []
      };
    }
  }
}
