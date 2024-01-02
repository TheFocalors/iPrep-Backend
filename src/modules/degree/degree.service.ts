import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Degree } from '@/entities/degree.entity';

@Injectable()
export class DegreeService {
  constructor(
    @InjectRepository(Degree)
    private readonly repo: Repository<Degree>,
  ) {}

  async getDegrees(searchQuery: string, limit = 10) {
    const queryBuilder = this.repo.createQueryBuilder('degree');
    if (searchQuery) {
      queryBuilder.where('degree.name ILIKE :searchQuery', {
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
