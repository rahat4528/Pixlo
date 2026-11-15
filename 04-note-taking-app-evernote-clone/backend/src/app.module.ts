import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { NotebooksModule } from './modules/notebooks/notebooks.module';
import { TagsModule } from './modules/tags/tags.module';
import { NotesModule } from './modules/notes/notes.module';
import { SyncModule } from './modules/sync/sync.module';
import { ClipperModule } from './modules/clipper/clipper.module';
import { PrismaService } from './common/prisma.service';

@Module({
  imports: [
    AuthModule,
    NotebooksModule,
    TagsModule,
    NotesModule,
    SyncModule,
    ClipperModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}
