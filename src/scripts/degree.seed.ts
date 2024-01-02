import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Repository } from 'typeorm';

import { Degree } from '@/entities/degree.entity';
import { AppConfigModule, TypeOrmModuleConfig } from '@/lib';

@Module({
  imports: [
    AppConfigModule,
    TypeOrmModuleConfig,
    TypeOrmModule.forFeature([Degree]),
  ],
})
class SeedModule {}

async function seed() {
  const app = await NestFactory.create<NestExpressApplication>(SeedModule);

  const repo = app.get<Repository<Degree>>(getRepositoryToken(Degree));

  // load data from json file
  const data = fs.readFileSync(
    path.join(__dirname, 'data', 'degree_with_id.json'),
  );

  const degree = JSON.parse(data.toString()) as Degree[];

  // save data to database
  await repo.save(degree);
}

seed();
