import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Institution } from '@/entities/institution.entity';

@Injectable()
export class InstitutionService {
  constructor(
    @InjectRepository(Institution)
    private readonly repo: Repository<Institution>,
  ) {}

  async getInstitutions(searchQuery: string, limit = 10) {
    const queryBuilder = this.repo.createQueryBuilder('institution');
    if (searchQuery) {
      queryBuilder.where('institution.name ILIKE :searchQuery', {
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
