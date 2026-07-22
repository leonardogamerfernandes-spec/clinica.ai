import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { MarketingService } from './marketing.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('api/marketing')
@UseGuards(AuthGuard)
export class MarketingController {
  constructor(private readonly marketingService: MarketingService) {}

  @Post('campaigns/draft')
  async getDrafts(@Req() req: any, @Body() body: { prompt: string }) {
    const tenantId = req.user.tenantId;
    return this.marketingService.createDraft(tenantId, body.prompt);
  }

  @Post('campaigns/send')
  async send(
    @Req() req: any,
    @Body() body: { name: string; prompt: string; drafts: Array<{ patientId: string; phone: string; content: string }> },
  ) {
    const tenantId = req.user.tenantId;
    return this.marketingService.sendCampaign(tenantId, body);
  }
}
