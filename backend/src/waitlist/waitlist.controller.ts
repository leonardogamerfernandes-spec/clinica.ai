import { Controller, Get, Post, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { WaitlistService } from './waitlist.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('api/waitlist')
@UseGuards(AuthGuard)
export class WaitlistController {
  constructor(private readonly waitlistService: WaitlistService) {}

  @Get()
  async getAll(@Req() req: any) {
    const tenantId = req.user.tenantId;
    return this.waitlistService.findAll(tenantId);
  }

  @Post()
  async create(
    @Req() req: any,
    @Body() body: { patientName: string; phone: string; preferredTime: string; reason: string },
  ) {
    const tenantId = req.user.tenantId;
    return this.waitlistService.create(tenantId, body);
  }

  @Delete(':id')
  async delete(@Req() req: any, @Param('id') id: string) {
    const tenantId = req.user.tenantId;
    return this.waitlistService.delete(tenantId, id);
  }
}
