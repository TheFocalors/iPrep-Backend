import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Repository } from 'typeorm';

import { JobCategory } from '@/entities/job-category.entity';
import { AppConfigModule, TypeOrmModuleConfig } from '@/lib';

@Module({
  imports: [
    AppConfigModule,
    TypeOrmModuleConfig,
    TypeOrmModule.forFeature([JobCategory]),
  ],
})
class SeedModule {}

async function seed() {
  const app = await NestFactory.create<NestExpressApplication>(SeedModule);

  const repo = app.get<Repository<JobCategory>>(
    getRepositoryToken(JobCategory),
  );

  // load data from json file
  const data = fs.readFileSync(
    path.join(__dirname, 'data', 'new_category.json'),
  );

  const categories = JSON.parse(data.toString()) as JobCategory[];

  // save data to database
  await repo.save(categories);
}

seed();
