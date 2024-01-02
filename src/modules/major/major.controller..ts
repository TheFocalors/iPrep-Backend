import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { MajorService } from './major.service';

@ApiTags('Major')
@Controller({ path: 'major', version: '1' })
export class MajorController {
  constructor(private readonly majorService: MajorService) {}

  @Get()
  @ApiOperation({ summary: 'Get majors' })
  async getMajors(
    @Query('q') searchQuery: string,
    @Query('limit') limit: number,
  ) {
    return await this.majorService.getMajors(searchQuery, limit);
  }
}
