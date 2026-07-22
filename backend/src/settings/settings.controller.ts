import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('api/settings')
@UseGuards(AuthGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('inventory')
  async getInventory(@Req() req: any) {
    const tenantId = req.user.tenantId;
    return this.settingsService.getInventory(tenantId);
  }

  @Post('inventory')
  async createInventory(
    @Req() req: any,
    @Body() body: { name: string; code: string; qty: string; expiry: string; supplier: string; status: string },
  ) {
    const tenantId = req.user.tenantId;
    return this.settingsService.createInventory(tenantId, body);
  }

  @Get('staff')
  async getStaff(@Req() req: any) {
    const tenantId = req.user.tenantId;
    return this.settingsService.getStaff(tenantId);
  }

  @Get('branches')
  async getBranches(@Req() req: any) {
    const tenantId = req.user.tenantId;
    return this.settingsService.getBranches(tenantId);
  }
}
