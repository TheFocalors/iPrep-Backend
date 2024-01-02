import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Repository } from 'typeorm';

import { Company } from '@/entities/company.entity';
import { AppConfigModule, TypeOrmModuleConfig } from '@/lib';

@Module({
  imports: [
    AppConfigModule,
    TypeOrmModuleConfig,
    TypeOrmModule.forFeature([Company]),
  ],
})
class SeedModule {}

async function seed() {
  const app = await NestFactory.create<NestExpressApplication>(SeedModule);

  const repo = app.get<Repository<Company>>(getRepositoryToken(Company));

  // load data from json file
  const data = fs.readFileSync(
    path.join(__dirname, 'data', 'unique_companies_with_logo.json'),
  );

  const companies = JSON.parse(data.toString());

  companies.forEach(
    async (company: {
      name: any;
      description: any;
      id: any;
      logo_filename: any;
      city: { [x: string]: any };
    }) => {
      await repo.save({
        name: company.name,
        description: company.description,
        id: company.id,
        logo: company.logo_filename,
        location: {
          id: company.city['id'] + 1, // I forgot to add 1 to the id when I create the cities data
        },
      });
    },
  );
}

seed();
