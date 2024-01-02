import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { SkillService } from './skill.service';

@ApiTags('Skill')
@Controller({ path: 'skill', version: '1' })
export class SkillController {
  constructor(private readonly skillService: SkillService) {}

  @Get()
  @ApiOperation({ summary: 'Get skills' })
  async getSkills(
    @Query('q') searchQuery: string,
    @Query('limit') limit: number,
  ) {
    return await this.skillService.getSkills(searchQuery, limit);
  }
}
