import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { JobOpening } from '@/entities/job-opening.entity';

import { JobOpeningController } from './job-opening.controller';
import { JobOpeningService } from './job-opening.service';
import { MilvusModule } from '../milvus/milvus.module';
import { OpenAIModule } from '../openai/openai.module';

@Module({
  imports: [TypeOrmModule.forFeature([JobOpening]), OpenAIModule, MilvusModule],
  controllers: [JobOpeningController],
  providers: [JobOpeningService],
  exports: [JobOpeningService],
})
export class JobOpeningModule {}
