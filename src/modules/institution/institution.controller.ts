import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { InstitutionService } from './institution.service';

@ApiTags('Institution')
@Controller({
  path: 'institution',
  version: '1',
})
export class InstitutionController {
  constructor(private readonly institutionService: InstitutionService) {}

  @Get()
  @ApiOperation({ summary: 'Get institutions' })
  async getInstitutions(
    @Query('q') searchQuery: string,
    @Query('limit') limit: number,
  ) {
    return await this.institutionService.getInstitutions(searchQuery, limit);
  }
}
