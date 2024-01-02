import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { City } from '@/entities/city.entity';

@Injectable()
export class CityService {
  constructor(
    @InjectRepository(City)
    private readonly repo: Repository<City>,
  ) {}

  async getCities(searchQuery: string, limit = 10) {
    const queryBuilder = this.repo.createQueryBuilder('city');
    if (searchQuery) {
      queryBuilder.where('city.name ILIKE :searchQuery', {
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
