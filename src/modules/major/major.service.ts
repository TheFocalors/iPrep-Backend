import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Major } from '@/entities/major.entity';

@Injectable()
export class MajorService {
  constructor(
    @InjectRepository(Major)
    private readonly repo: Repository<Major>,
  ) {}

  async getMajors(searchQuery: string, limit = 10) {
    const queryBuilder = this.repo.createQueryBuilder('major');

    if (searchQuery) {
      queryBuilder.where('major.name ILIKE :searchQuery', {
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
