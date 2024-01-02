import { Controller, Get, Render } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller({
  path: 'terms-and-conditions',
})
@ApiTags('Terms and Conditions')
export class TCController {
  @Get()
  @Render('terms-and-conditions')
  @ApiOperation({
    operationId: 'Get Terms and Conditions',
    description: 'Show Terms and Conditions Page',
  })
  async root() {
    return {};
  }
}
