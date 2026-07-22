import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { ProceduresService } from './procedures.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('api/procedures')
@UseGuards(AuthGuard)
export class ProceduresController {
  constructor(private readonly proceduresService: ProceduresService) {}

  @Get()
  async getAll(@Req() req: any) {
    const tenantId = req.user.tenantId;
    return this.proceduresService.findAll(tenantId);
  }

  @Post()
  async create(
    @Req() req: any,
    @Body() body: { name: string; price: number; duration: number },
  ) {
    const tenantId = req.user.tenantId;
    return this.proceduresService.create(tenantId, body);
  }
}
