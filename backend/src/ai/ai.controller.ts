import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { AuthGuard } from '../auth/auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@Controller('api/ai')
@UseGuards(AuthGuard)
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('chat')
  async chat(
    @Req() req: any,
    @Body() body: { prompt: string },
  ) {
    const tenantId = req.user.tenantId;
    return this.aiService.getChatResponse(tenantId, body.prompt);
  }

  @Post('ocr')
  async ocr(
    @Req() req: any,
    @Body() body: { fileBase64: string; mimeType: string; patientId?: string },
  ) {
    const tenantId = req.user.tenantId;
    const result = await this.aiService.runOCR(body.fileBase64, body.mimeType);

    // Persist OCR findings directly to patient records in the PostgreSQL DB
    if (body.patientId && !result.error) {
      const patient = await this.prisma.patient.findFirst({
        where: { id: body.patientId, tenantId },
      });

      if (patient) {
        const dateStr = new Date().toLocaleDateString('pt-BR');
        const formattedConclusion = `[Digitalização ${dateStr}] ${result.aiConclusion}`;
        const updatedNotes = patient.notes 
          ? `${patient.notes}\n\n${formattedConclusion}` 
          : formattedConclusion;

        await this.prisma.patient.update({
          where: { id: body.patientId },
          data: { notes: updatedNotes },
        });
      }
    }

    return result;
  }
}
