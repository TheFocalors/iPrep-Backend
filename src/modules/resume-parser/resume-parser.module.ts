import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Skill } from '@/entities/skill.entity';

import { ResumeParserController } from './resume-parser.controller';
import { ResumeParserService } from './resume-parser.service';
import { MilvusModule } from '../milvus/milvus.module';

@Module({
  imports: [MilvusModule, ConfigModule, TypeOrmModule.forFeature([Skill])],
  controllers: [ResumeParserController],
  providers: [ResumeParserService],
  exports: [],
})
export class ResumeParserModule {}
