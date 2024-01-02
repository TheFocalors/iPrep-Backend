import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { CityService } from './city.service';

@ApiTags('City')
@Controller({
  path: 'city',
  version: '1',
})
export class CityController {
  constructor(private readonly cityService: CityService) {}

  @Get()
  @ApiOperation({ summary: 'Get cities' })
  async getCities(
    @Query('q') searchQuery: string,
    @Query('limit') limit: number,
  ) {
    return await this.cityService.getCities(searchQuery, limit);
  }
}
