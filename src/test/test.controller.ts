import { Controller, Get } from '@nestjs/common';

@Controller('test')
export class TestController {
  @Get()
  test() {
    console.log('path', __dirname);
    return 'Testing...';
  }
}
