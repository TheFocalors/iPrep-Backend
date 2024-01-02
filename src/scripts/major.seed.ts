import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Repository } from 'typeorm';

import { Major } from '@/entities/major.entity';
import { AppConfigModule, TypeOrmModuleConfig } from '@/lib';

@Module({
  imports: [
    AppConfigModule,
    TypeOrmModuleConfig,
    TypeOrmModule.forFeature([Major]),
  ],
})
class SeedModule {}

async function seed() {
  const app = await NestFactory.create<NestExpressApplication>(SeedModule);

  const repo = app.get<Repository<Major>>(getRepositoryToken(Major));

  // load data from json file
  const data = fs.readFileSync(
    path.join(__dirname, 'data', 'major_merged.json'),
  );

  const majors = JSON.parse(data.toString()) as Major[];

  // save data to database
  await repo.save(majors);
}

seed();
