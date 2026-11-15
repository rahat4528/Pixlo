import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    // Connect to database in live environments
    if (process.env.NODE_ENV !== 'test') {
      try {
        await this.$connect();
      } catch (err) {
        console.warn('Prisma could not connect to database at startup:', err.message);
      }
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
