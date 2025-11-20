import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Delete,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { successMessages } from 'src/utils/response.messages';
import { SharedService } from 'src/services/shared.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private sharedService: SharedService,
  ) {}

  @Post()
  create() {
    return this.usersService.create();
  }

  @Get('list')
  async findAll() {
    const usersList = await this.usersService.findAll();
    return this.sharedService.sendSuccess(
      successMessages.USERS_FETCH_SUCCESSFULLY,
      HttpStatus.OK,
      usersList,
    );
  }

  @Get(':id')
  async findUserById(@Param('id') id: string) {
    const usersList = await this.usersService.findUserById(id);
    return this.sharedService.sendSuccess(
      successMessages.USERS_DETAIL_FETCH_SUCCESSFULLY,
      HttpStatus.OK,
      usersList,
    );
  }

  @Patch(':id')
  update(@Param('id') id: string) {
    return this.usersService.update(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
