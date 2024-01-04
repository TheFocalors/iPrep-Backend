import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Degree } from '@/entities/degree.entity';
import { Institution } from '@/entities/institution.entity';
import { Major } from '@/entities/major.entity';
import { Skill } from '@/entities/skill.entity';

import { ResumeParserController } from './resume-parser.controller';
import { ResumeParserService } from './resume-parser.service';
import { MilvusModule } from '../milvus/milvus.module';

@Module({
  imports: [
    MilvusModule,
    ConfigModule,
    TypeOrmModule.forFeature([Skill, Major, Degree, Institution]),
  ],
  controllers: [ResumeParserController],
  providers: [ResumeParserService],
  exports: [],
})
export class ResumeParserModule {}
