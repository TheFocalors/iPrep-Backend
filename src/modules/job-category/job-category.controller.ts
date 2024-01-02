import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { JobCategoryService } from './job-category.service';

@ApiTags('Job Category')
@Controller({
  path: 'job-category',
  version: '1',
})
export class JobCategoryController {
  constructor(private readonly jobCategoryService: JobCategoryService) {}

  @Get()
  @ApiOperation({ summary: 'Get job categories' })
  async getCategories(
    @Query('q') searchQuery: string,
    @Query('limit') limit: number,
  ) {
    return await this.jobCategoryService.getJobCategories(searchQuery, limit);
  }
}
