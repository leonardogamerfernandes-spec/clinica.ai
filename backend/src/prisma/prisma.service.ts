import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const connectionString = process.env.DATABASE_URL || 'postgresql://clinicai:clinicai_password@localhost:5432/clinicai_db?schema=public';
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    super({ adapter });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      console.log('Successfully connected to the database.');
    } catch (error) {
      console.error('Database connection failed. Fallback or recovery required.', error);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
