import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { DegreeService } from './degree.service';

@ApiTags('Degree')
@Controller({
  path: 'degree',
  version: '1',
})
export class DegreeController {
  constructor(private readonly degreeService: DegreeService) {}

  @Get()
  @ApiOperation({ summary: 'Get degrees' })
  async getDegrees(
    @Query('q') searchQuery: string,
    @Query('limit') limit: number,
  ) {
    return await this.degreeService.getDegrees(searchQuery, limit);
  }
}
