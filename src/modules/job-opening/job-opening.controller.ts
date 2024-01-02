import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Paginate, PaginateQuery } from 'nestjs-paginate';

import { ApiErrorMessage } from '@/common/constants/api-error-message.constant';
import { LoggedUser } from '@/common/decorators/logged-user.decorator';
import { PaginateQueryOptions } from '@/common/decorators/paginate-query-options.decorator';
import { UseAuth } from '@/common/decorators/use-auth.decorator';
import APIError from '@/common/exceptions/api-error.exception';
import { LoggedUserType } from '@/common/types/types/logged-user.type';
import { JobOpening } from '@/entities/job-opening.entity';

import { JobOpeningService } from './job-opening.service';

@Controller({
  version: '1',
  path: 'jobs',
})
@ApiTags('Job Opening')
export class JobOpeningController {
  constructor(private readonly jobOpeningService: JobOpeningService) {}

  @ApiOperation({ summary: 'Get all job openings with pagination' })
  @PaginateQueryOptions(
    JobOpening,
    false,
    'city',
    'company',
    'category',
    'skillRequirements',
    'salaryFrom',
    'salaryTo',
  )
  @Get('feed')
  async getAllJobOpeningsWithPagination(@Paginate() query: PaginateQuery) {
    const result = await this.jobOpeningService.getAllJobOpeningsWithPagination(
      query,
    );

    if (result.isErr()) {
      throw APIError.fromMessage(
        ApiErrorMessage.INTERNAL_SERVER_ERROR,
        result.error.cause,
      );
    }

    return result.value;
  }

  @ApiOperation({ summary: 'Get job opening recommendations' })
  @UseAuth({
    profileFilled: true,
  })
  @Get('recommendations')
  async getJobOpeningRecommendations(
    @LoggedUser() user: LoggedUserType,
    @Paginate() query: PaginateQuery,
  ) {
    return this.jobOpeningService.jobOpeningRecommendation(query, user);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search job openings' })
  async searchJobOpenings(
    @Query('q') search: string,
    @Paginate() query: Omit<PaginateQuery, 'search' | 'filter' | 'select'>,
  ) {
    const result = await this.jobOpeningService.searchJobOpenings(
      search,
      query,
    );

    if (result.isErr()) {
      throw APIError.fromMessage(
        ApiErrorMessage.INTERNAL_SERVER_ERROR,
        result.error.cause,
      );
    }

    return result.value;
  }

  @ApiOperation({ summary: 'Get a job opening detail' })
  @ApiOkResponse({
    description: 'Return a job opening',
  })
  @Get(':id')
  async getJobOpeningDetail(@Param('id') id: string) {
    const result = await this.jobOpeningService.getJobOpeningById(id);

    if (result.isErr()) {
      const e = result.error;

      switch (e.name) {
        case 'JOB_OPENING_NOT_FOUND':
          throw APIError.fromMessage(ApiErrorMessage.JOB_OPENING_NOT_FOUND);
        default:
          throw APIError.fromMessage(
            ApiErrorMessage.INTERNAL_SERVER_ERROR,
            e.cause,
          );
      }
    }
    return result.value;
  }
}
