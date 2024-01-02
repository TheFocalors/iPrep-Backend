import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { JobCategory } from '@/entities/job-category.entity';

@Injectable()
export class JobCategoryService {
  constructor(
    @InjectRepository(JobCategory)
    private readonly repo: Repository<JobCategory>,
  ) {}

  async getJobCategories(searchQuery: string, limit = 10) {
    const queryBuilder = this.repo.createQueryBuilder('jobCategory');
    if (searchQuery) {
      queryBuilder.where('jobCategory.name ILIKE :searchQuery', {
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
