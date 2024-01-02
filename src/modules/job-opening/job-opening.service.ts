import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FilterOperator,
  paginate,
  PaginateConfig,
  PaginateQuery,
} from 'nestjs-paginate';
import { err, ok } from 'neverthrow';
import { In, Repository } from 'typeorm';

import { ServiceException } from '@/common/exceptions/service.exception';
import { LoggedUserType } from '@/common/types/types/logged-user.type';
import { JobOpening } from '@/entities/job-opening.entity';

import { MilvusService } from '../milvus/milvus.service';
import { OpenAIService } from '../openai/openai.service';

@Injectable()
export class JobOpeningService {
  constructor(
    @InjectRepository(JobOpening)
    private readonly jobRepo: Repository<JobOpening>,
    private readonly openAIService: OpenAIService,
    private readonly milvusService: MilvusService,
  ) {}

  private readonly paginationConfig: PaginateConfig<JobOpening> = {
    sortableColumns: ['id', 'salaryFrom', 'salaryTo', 'createdAt', 'updatedAt'],
    nullSort: 'last',
    defaultLimit: 10,
    defaultSortBy: [['updatedAt', 'ASC']],
    filterableColumns: {
      jobType: [FilterOperator.EQ],
      category: [FilterOperator.EQ],
      salaryFrom: [FilterOperator.GTE],
      salaryTo: [FilterOperator.LTE],
      city: [FilterOperator.EQ],
      company: [FilterOperator.EQ],
    },
  };

  async getJobOpeningById(id: string) {
    const jobOpening = await this.jobRepo.findOne({
      where: { id },
      relations: [
        'company',
        'city',
        'category',
        'skillRequirements',
        'company.location',
      ],
    });

    if (!jobOpening) {
      return err(new ServiceException('JOB_OPENING_NOT_FOUND'));
    }

    return ok(jobOpening);
  }

  async getAllJobOpeningsWithPagination(query: PaginateQuery) {
    const queryBuilder = this.jobRepo
      .createQueryBuilder('job')
      .leftJoinAndSelect('job.category', 'category')
      .leftJoinAndSelect('job.company', 'company')
      .leftJoinAndSelect('job.city', 'city')
      .leftJoinAndSelect('job.skillRequirements', 'skillRequirements')
      .select([
        'job.id',
        'job.title',
        'job.description',
        'job.source',
        'job.jobType',
        'job.salaryFrom',
        'job.salaryTo',
        'job.createdAt',
        'job.updatedAt',
        'city.name',
        'city.id',
        'company',
        'category.name',
        'category.id',
        'skillRequirements.name',
        'skillRequirements.id',
      ]);

    if (query.filter?.skillRequirements) {
      const skills = (query.filter.skillRequirements as string).split(',');

      queryBuilder.andWhere('skillRequirements.id IN (:...skillIds)', {
        skillIds: skills,
      });
    }

    if (query.filter?.['category.name']) {
      queryBuilder.andWhere('category.name ILIKE :categoryName', {
        categoryName: `%${query?.filter['category.name']}%`,
      });
    }

    try {
      const paginatedJobOpenings = await paginate<JobOpening>(
        query,
        queryBuilder,
        this.paginationConfig,
      );

      return ok(paginatedJobOpenings);
    } catch (e) {
      return err(new ServiceException('INTERNAL_SERVER_ERROR', e));
    }
  }

  public async jobOpeningRecommendation(
    query: PaginateQuery,
    user: LoggedUserType,
  ) {
    const profile = user.profile;

    const queryBuilder = this.jobRepo
      .createQueryBuilder('job')
      .leftJoinAndSelect('job.category', 'category')
      .leftJoinAndSelect('job.company', 'company')
      .leftJoinAndSelect('job.city', 'city')
      .leftJoinAndSelect('job.skillRequirements', 'skills')
      .select([
        'job.id',
        'job.title',
        'job.description',
        'job.source',
        'job.jobType',
        'job.salaryFrom',
        'job.salaryTo',
        'job.createdAt',
        'job.updatedAt',
        'city.name',
        'city.id',
        'city.coordinate',
        'company',
        'category.name',
        'category.id',
        'skills.name',
        'skills.id',
        'ST_Distance(ST_MakePoint(:lat, :long), city.coordinate) AS distance',
      ]);

    queryBuilder.andWhere('job.jobType IN (:...jobTypes)', {
      jobTypes: profile.preferredJobTypes,
    });

    queryBuilder.andWhere('skills.id IN (:...skillIds)', {
      skillIds: profile.skills.map((skill) => skill.id),
    });

    queryBuilder.andWhere('job.salaryFrom >= :salary', {
      salary: profile.expectedSalary,
    });

    // Filter by city coordinate up to 50 km from the user city
    queryBuilder.andWhere(
      `ST_Distance(ST_MakePoint(:lat, :long), city.coordinate) < :max`,
      {
        max: 50000,
        lat: profile.city.coordinate.coordinates[0],
        long: profile.city.coordinate.coordinates[1],
      },
    );

    // Sort by the highest salary
    queryBuilder.orderBy({
      'job.salaryTo': 'DESC',
    });

    return paginate<JobOpening>(query, queryBuilder, this.paginationConfig);
  }

  public async searchJobOpenings(search: string, query: PaginateQuery) {
    query.limit = query.limit || 20;
    query.page = query.page || 1;

    const searchVector = await this.openAIService.generateEmbeddings(search);

    if (searchVector.isErr()) {
      const e = searchVector.error;

      return err(new ServiceException('INTERNAL_SERVER_ERROR', e));
    }

    const searchResult = await this.milvusService.searchVectors({
      collectionName: 'job_posting',
      limit: query.limit,
      queryVectors: [searchVector.value],
      // offset: query.limit * (query.page - 1),
    });

    const matchResult = searchResult.results.map((result) => result.id);

    const [jobOpenings, count] = await this.jobRepo.findAndCount({
      where: { id: In(matchResult) },
      relations: ['company', 'city', 'category', 'skillRequirements'],
    });

    const orderedJobOpenings = jobOpenings.sort(
      (a, b) => matchResult.indexOf(a.id) - matchResult.indexOf(b.id),
    );

    return ok({
      data: orderedJobOpenings,
      meta: {
        itemsPerPage: query.limit,
        totalItems: count,
        currentPage: query.page,
      },
    });
  }

  public async composeJobOpeningFromId(id: string) {
    const jobOpening = await this.jobRepo.findOne({
      where: { id },
      relations: ['company', 'city', 'category', 'skillRequirements'],
    });

    if (!jobOpening) {
      return err(new ServiceException('JOB_OPENING_NOT_FOUND'));
    }

    const compose = `Job title: ${jobOpening.title}\nCompany name: ${
      jobOpening.company.name
    }\nResponsibilities: ${jobOpening.responsibilities.join(
      ',',
    )}\nQualifications: ${jobOpening.requirements.join(
      ',',
    )}\nSkills: ${jobOpening.skillRequirements
      .map((skill) => skill.name)
      .join(', ')}\nCity: ${jobOpening.city.name}\nType: ${jobOpening.jobType}`;

    return ok(compose);
  }
}
