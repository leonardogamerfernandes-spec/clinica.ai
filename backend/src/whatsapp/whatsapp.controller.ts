import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('api/whatsapp')
export class WhatsappController {
  constructor(private readonly whatsappService: WhatsappService) {}

  @Get('messages')
  @UseGuards(AuthGuard)
  async getMessages(@Req() req: any) {
    const tenantId = req.user.tenantId;
    return this.whatsappService.getMessages(tenantId);
  }

  @Get('connect')
  @UseGuards(AuthGuard)
  async connect(@Req() req: any) {
    const tenantId = req.user.tenantId;
    return this.whatsappService.getConnectionStatus(tenantId);
  }

  @Post('pair')
  @UseGuards(AuthGuard)
  async pair(@Req() req: any) {
    const tenantId = req.user.tenantId;
    return this.whatsappService.connectInstance(tenantId);
  }

  @Post('disconnect')
  @UseGuards(AuthGuard)
  async disconnect(@Req() req: any) {
    const tenantId = req.user.tenantId;
    return this.whatsappService.disconnectInstance(tenantId);
  }

  @Post('webhook')
  async webhook(@Body() body: any) {
    return this.whatsappService.handleIncomingWebhook(body);
  }

  @Post('simulate-receive')
  @UseGuards(AuthGuard)
  async simulateReceive(
    @Req() req: any,
    @Body() body: { phone: string; content: string },
  ) {
    const tenantId = req.user.tenantId;
    return this.whatsappService.simulateReceive(tenantId, body);
  }

  @Post('simulate-incoming')
  @UseGuards(AuthGuard)
  async simulateIncoming(
    @Req() req: any,
    @Body() body: { phone: string; content: string },
  ) {
    const tenantId = req.user.tenantId;
    return this.whatsappService.simulateReceive(tenantId, body);
  }
}
