import { Global, Module } from '@nestjs/common';
import { PrismaService } from 'src/services/prisma.service';
import { SharedService } from 'src/services/shared.service';

@Global()
@Module({
  providers: [SharedService, PrismaService],
  exports: [SharedService, PrismaService],
})
export class SharedModule {}
