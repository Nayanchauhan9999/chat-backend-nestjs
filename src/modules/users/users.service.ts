import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/services/prisma.service';
import { SharedService } from 'src/services/shared.service';
import { Logger } from 'winston';
import { errorMessages } from 'src/utils/response.messages';
import { isUUID } from 'class-validator';

@Injectable()
export class UsersService {
  constructor(
    private sharedService: SharedService,
    private prisma: PrismaService,
    @Inject('winston') private logger: Logger,
  ) {}

  create() {
    return 'This action adds a new user';
  }

  async findAll() {
    try {
      return await this.prisma.user.findMany();
    } catch {
      return this.sharedService.sendError(errorMessages.SOMETHING_WENT_WRONG);
    }
  }

  async findUserById(userId: string) {
    if (!userId || !isUUID(userId)) {
      return this.sharedService.sendError(
        errorMessages.INVALID_OR_MISSING_ID,
        HttpStatus.BAD_REQUEST,
      );
    }

    const userDetail = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      omit: { isDeleted: true, password: true },
    });

    if (!userDetail) {
      return this.sharedService.sendError(
        errorMessages.DATA_NOT_FOUND,
        HttpStatus.BAD_REQUEST,
      );
    }

    return userDetail;
  }

  update(id: string) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
