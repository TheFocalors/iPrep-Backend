import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Repository } from 'typeorm';

import { City } from '@/entities/city.entity';
import { AppConfigModule, TypeOrmModuleConfig } from '@/lib';

@Module({
  imports: [
    AppConfigModule,
    TypeOrmModuleConfig,
    TypeOrmModule.forFeature([City]),
  ],
})
class SeedModule {}

async function seed() {
  const app = await NestFactory.create<NestExpressApplication>(SeedModule);

  const repo = app.get<Repository<City>>(getRepositoryToken(City));

  // load data from json file
  const data = fs.readFileSync(
    path.join(__dirname, 'data', 'cities_with_id.json'),
  );

  const cities = JSON.parse(data.toString());

  cities.forEach((city: { name: any; coordinate: { geometry: any } }) => {
    city.name = city.name;
    city.coordinate = city.coordinate.geometry;
  });

  // save data to database
  await repo.save(cities);
}

seed();
