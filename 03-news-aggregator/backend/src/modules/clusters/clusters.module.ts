import { Module } from '@nestjs/common';
import { ClustersService } from './clusters.service';
import { ClustersController } from './clusters.controller';
import { PrismaService } from '../../common/prisma.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [ClustersController],
  providers: [ClustersService, PrismaService],
  exports: [ClustersService],
})
export class ClustersModule {}
