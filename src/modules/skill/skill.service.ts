import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Skill } from '@/entities/skill.entity';

@Injectable()
export class SkillService {
  constructor(
    @InjectRepository(Skill)
    private readonly repo: Repository<Skill>,
  ) {}

  async getSkills(searchQuery: string, limit = 10) {
    const queryBuilder = this.repo.createQueryBuilder('skill');

    if (searchQuery) {
      queryBuilder.where('skill.name ILIKE :searchQuery', {
        searchQuery: `%${searchQuery}%`,
      });
    }

    if (limit) {
      queryBuilder.limit(limit);
    }

    const [data, totalData] = await queryBuilder.getManyAndCount();

    return {
      data,
      meta: {
        totalItems: totalData,
        itemsPerPage: limit,
      },
    };
  }
}
