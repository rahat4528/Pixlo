import { Module } from '@nestjs/common';
import { AuthorsService } from './authors.service';
import { AuthorsController } from './authors.controller';
import { PrismaService } from '../../common/prisma.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [AuthorsController],
  providers: [AuthorsService, PrismaService],
  exports: [AuthorsService],
})
export class AuthorsModule {}
