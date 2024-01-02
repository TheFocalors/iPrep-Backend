import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { JobCategory } from '@/entities/job-category.entity';

import { JobCategoryController } from './job-category.controller';
import { JobCategoryService } from './job-category.service';

@Module({
  imports: [TypeOrmModule.forFeature([JobCategory])],
  controllers: [JobCategoryController],
  providers: [JobCategoryService],
  exports: [JobCategoryService],
})
export class JobCategoryModule {}
