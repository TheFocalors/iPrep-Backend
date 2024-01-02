import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Repository } from 'typeorm';

import { JobOpening } from '@/entities/job-opening.entity';
import { Skill } from '@/entities/skill.entity';
import { AppConfigModule, TypeOrmModuleConfig } from '@/lib';

@Module({
  imports: [
    AppConfigModule,
    TypeOrmModuleConfig,
    TypeOrmModule.forFeature([JobOpening, Skill]),
  ],
})
class SeedModule {}

async function seed() {
  const app = await NestFactory.create<NestExpressApplication>(SeedModule);

  const repo = app.get<Repository<JobOpening>>(getRepositoryToken(JobOpening));
  const skillRepo = app.get<Repository<Skill>>(getRepositoryToken(Skill));

  const data = fs.readFileSync(
    path.join(__dirname, 'data', 'fix_job_list_with_company_id.json'),
  );

  const jobs = JSON.parse(data.toString());

  for (let i = 0; i < jobs.length; i++) {
    const job = jobs[i];

    const skills = (job.skills_skill_name as string[]).map(async (skill) => {
      const skillDB = await skillRepo.findOne({
        where: {
          name: skill,
        },
      });

      if (!skillDB) {
        const newSkill = await skillRepo.save({
          name: skill,
        });

        return {
          id: newSkill.id,
        };
      }

      return {
        id: skillDB.id,
      };
    });

    const skills2 = await Promise.all(skills);

    const newJob = await repo.save(
      repo.create({
        id: job.id,
        title: job.title,
        description: job.description,
        category: {
          id: job.new_id + 1,
        },
        source: job.source,
        jobType: job.type,
        city: {
          id: job.new_city_id + 1,
        },
        salaryFrom: job.salaries_minAmount,
        salaryTo: job.salaries_maxAmount,
        requirements: job.qualification,
        responsibilities: job.responsibilities,
        company: {
          id: job.company_id,
        },
        skillRequirements: skills2,
      }),
    );
  }
}

seed();
