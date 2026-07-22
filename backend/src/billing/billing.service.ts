import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getSubscriptionStatus(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        id: true,
        name: true,
        planType: true,
        subscriptionStatus: true,
        stripeCustomerId: true,
        createdAt: true,
      },
    });

    if (!tenant) {
      return {
        planType: 'FREE',
        subscriptionStatus: 'FREE',
        messagesUsed: 0,
        messagesLimit: 100,
        features: ['100 Mensagens/mês', '1 Atendente', 'Agendamento Básico'],
      };
    }

    // Calculate usage metrics for current month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const messagesCount = await this.prisma.whatsAppMessage.count({
      where: {
        tenantId,
        createdAt: { gte: startOfMonth },
      },
    });

    const isPro = tenant.planType === 'PRO' || tenant.planType === 'ENTERPRISE';
    const isActive = tenant.subscriptionStatus === 'ACTIVE';

    return {
      tenant,
      planType: tenant.planType || 'FREE',
      subscriptionStatus: tenant.subscriptionStatus || 'FREE',
      messagesUsed: messagesCount,
      messagesLimit: isPro && isActive ? 'Ilimitado' : 100,
      features: isPro && isActive
        ? ['Mensagens & Disparos Ilimitados', 'IA Personalizada', 'Anti No-Show Ativo', 'Suporte Prioritário']
        : ['100 Mensagens/mês', '1 Atendente', 'Agendamento Básico'],
    };
  }

  async createCheckoutSession(
    tenantId: string,
    planType: string = 'PRO',
    interval: 'monthly' | 'annual' = 'annual',
  ) {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    // 1. Real Stripe Integration if API Key is configured
    if (stripeKey) {
      try {
        const amount = planType === 'ENTERPRISE'
          ? (interval === 'annual' ? 24700 : 29700)
          : (interval === 'annual' ? 9700 : 12700);

        const params = new URLSearchParams();
        params.append('payment_method_types[]', 'card');
        params.append('mode', 'subscription');
        params.append('line_items[0][price_data][currency]', 'brl');
        params.append('line_items[0][price_data][product_data][name]', `Plano ${planType} - Clínica.ai (${interval === 'annual' ? 'Anual' : 'Mensal'})`);
        params.append('line_items[0][price_data][unit_amount]', amount.toString());
        params.append('line_items[0][price_data][recurring][interval]', interval === 'annual' ? 'year' : 'month');
        params.append('line_items[0][quantity]', '1');
        params.append('success_url', `${frontendUrl}/configuracoes?billing_success=true&plan=${planType}`);
        params.append('cancel_url', `${frontendUrl}/configuracoes?billing_canceled=true`);
        params.append('client_reference_id', tenantId);

        const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${stripeKey}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params.toString(),
        });

        if (response.ok) {
          const session = await response.json();
          return {
            url: session.url,
            sessionId: session.id,
            mode: 'stripe_live',
          };
        } else {
          const errorErr = await response.json();
          this.logger.error('Stripe API error response:', errorErr);
        }
      } catch (err) {
        this.logger.error('Failed to create Stripe session, falling back to instant sandbox mode', err);
      }
    }

    // 2. Dev Fallback Simulation: Instantly activate plan in database
    const tenant = await this.prisma.tenant.update({
      where: { id: tenantId },
      data: {
        subscriptionStatus: 'ACTIVE',
        planType: planType.toUpperCase(),
      },
    });

    return {
      url: `${frontendUrl}/configuracoes?billing_success=true&plan=${planType}`,
      tenant,
      mode: 'simulated_sandbox',
    };
  }

  async handleWebhook(body: any, signature?: string) {
    this.logger.log(`Received billing webhook payload. Event type: ${body?.type || 'unknown'}`);

    const eventType = body?.type;

    if (eventType === 'checkout.session.completed') {
      const session = body.data?.object;
      const tenantId = session?.client_reference_id;
      const customerId = session?.customer;

      if (tenantId) {
        await this.prisma.tenant.update({
          where: { id: tenantId },
          data: {
            subscriptionStatus: 'ACTIVE',
            planType: 'PRO',
            stripeCustomerId: customerId || null,
          },
        });
        this.logger.log(`Subscription activated for tenant: ${tenantId}`);
      }
    } else if (eventType === 'customer.subscription.deleted') {
      const subscription = body.data?.object;
      const customerId = subscription?.customer;

      if (customerId) {
        const tenant = await this.prisma.tenant.findFirst({
          where: { stripeCustomerId: customerId },
        });

        if (tenant) {
          await this.prisma.tenant.update({
            where: { id: tenant.id },
            data: {
              subscriptionStatus: 'CANCELED',
              planType: 'FREE',
            },
          });
          this.logger.log(`Subscription canceled for tenant: ${tenant.id}`);
        }
      }
    }

    return { received: true };
  }
}
