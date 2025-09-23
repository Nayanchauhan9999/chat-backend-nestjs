import { Controller, Get } from '@nestjs/common';

@Controller('user')
export class UserController {
  @Get()
  createUser(): string {
    return 'user created';
  }
}
