import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Repository } from 'typeorm';

import { Institution } from '@/entities/institution.entity';
import { AppConfigModule, TypeOrmModuleConfig } from '@/lib';

@Module({
  imports: [
    AppConfigModule,
    TypeOrmModuleConfig,
    TypeOrmModule.forFeature([Institution]),
  ],
})
class SeedModule {}

async function seed() {
  const app = await NestFactory.create<NestExpressApplication>(SeedModule);

  const repo = app.get<Repository<Institution>>(
    getRepositoryToken(Institution),
  );

  // load data from json file
  const data = fs.readFileSync(
    path.join(__dirname, 'data', 'university_list_with_id.json'),
  );

  const institutions = JSON.parse(data.toString()) as Institution[];

  // save data to database
  await repo.save(institutions);
}

seed();
