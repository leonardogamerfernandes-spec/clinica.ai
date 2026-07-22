import { Controller, Get, Post, Body, UseGuards, Req, Param } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('api/patients')
@UseGuards(AuthGuard)
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Get()
  async getAll(@Req() req: any) {
    const tenantId = req.user.tenantId;
    return this.patientsService.findAll(tenantId);
  }

  @Post()
  async create(
    @Req() req: any,
    @Body() body: { name: string; phone: string; notes?: string },
  ) {
    const tenantId = req.user.tenantId;
    return this.patientsService.create(tenantId, body);
  }

  @Get(':patientId/prescriptions')
  async getPrescriptions(@Req() req: any, @Param('patientId') patientId: string) {
    const tenantId = req.user.tenantId;
    return this.patientsService.getPrescriptions(tenantId, patientId);
  }

  @Post(':patientId/prescriptions')
  async createPrescription(
    @Req() req: any,
    @Param('patientId') patientId: string,
    @Body() body: { medicines: string; instructions: string },
  ) {
    const tenantId = req.user.tenantId;
    return this.patientsService.createPrescription(tenantId, patientId, body);
  }

  @Post(':patientId/prescriptions/generate-ai')
  async generateAiPrescription(
    @Req() req: any,
    @Param('patientId') patientId: string,
    @Body() body: { symptoms: string },
  ) {
    const tenantId = req.user.tenantId;
    return this.patientsService.generateAiPrescription(tenantId, patientId, body.symptoms);
  }

  @Get(':patientId/teeth')
  async getTeeth(@Req() req: any, @Param('patientId') patientId: string) {
    const tenantId = req.user.tenantId;
    return this.patientsService.getTeethTreatments(tenantId, patientId);
  }

  @Post(':patientId/teeth')
  async updateTooth(
    @Req() req: any,
    @Param('patientId') patientId: string,
    @Body() body: { toothNumber: number; condition: string; notes?: string },
  ) {
    const tenantId = req.user.tenantId;
    return this.patientsService.updateToothTreatment(tenantId, patientId, body.toothNumber, body);
  }
}
