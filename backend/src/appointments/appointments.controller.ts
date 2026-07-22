import { Controller, Get, Post, Patch, Body, Param, UseGuards, Req } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { AppointmentsSchedulerService } from './appointments-scheduler.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('api/appointments')
@UseGuards(AuthGuard)
export class AppointmentsController {
  constructor(
    private readonly appointmentsService: AppointmentsService,
    private readonly appointmentsSchedulerService: AppointmentsSchedulerService,
  ) {}

  @Get()
  async getAll(@Req() req: any) {
    const tenantId = req.user.tenantId;
    return this.appointmentsService.findAll(tenantId);
  }

  @Post()
  async create(
    @Req() req: any,
    @Body() body: { patientName: string; phone: string; scheduledAt: string; procedure?: string; doctorId?: string }
  ) {
    const tenantId = req.user.tenantId;
    return this.appointmentsService.create(tenantId, body);
  }

  @Post('trigger-reminders')
  async triggerReminders(@Req() req: any) {
    const tenantId = req.user.tenantId;
    return this.appointmentsSchedulerService.triggerManualReminders(tenantId);
  }

  @Patch(':id/status')
  async updateStatus(
    @Req() req: any,
    @Param('id') id: string, 
    @Body() body: { status: string }
  ) {
    const tenantId = req.user.tenantId;
    return this.appointmentsService.updateStatus(tenantId, id, body.status);
  }
}
