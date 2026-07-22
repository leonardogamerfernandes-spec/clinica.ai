import { Controller, Post, Get, Body, Req, Headers, UseGuards } from '@nestjs/common';
import { BillingService } from './billing.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('api/billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get('status')
  @UseGuards(AuthGuard)
  async getStatus(@Req() req: any) {
    const tenantId = req.user.tenantId;
    return this.billingService.getSubscriptionStatus(tenantId);
  }

  @Post('checkout')
  @UseGuards(AuthGuard)
  async checkout(
    @Req() req: any,
    @Body() body: { planType?: string; interval?: 'monthly' | 'annual' },
  ) {
    const tenantId = req.user.tenantId;
    const planType = body?.planType || 'PRO';
    const interval = body?.interval || 'annual';
    return this.billingService.createCheckoutSession(tenantId, planType, interval);
  }

  @Post('webhook')
  async webhook(
    @Body() body: any,
    @Headers('stripe-signature') signature?: string,
  ) {
    return this.billingService.handleWebhook(body, signature);
  }
}
