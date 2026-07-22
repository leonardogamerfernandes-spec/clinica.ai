import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { PublicService } from './public.service';

@Controller('api/public')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @Get('clinic/:clinicId')
  async getClinicDetails(@Param('clinicId') clinicId: string) {
    return this.publicService.getClinicDetails(clinicId);
  }

  @Post('clinic/:clinicId/book')
  async book(
    @Param('clinicId') clinicId: string,
    @Body() body: { patientName: string; phone: string; doctorId: string; procedureId: string; scheduledAt: string },
  ) {
    return this.publicService.bookAppointment(clinicId, body);
  }
}
