import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { RoomService } from './room.service';
import { RoomController } from './room.controller';
import { AuthMiddleware } from 'src/middleware/auth.middleware';

@Module({
  controllers: [RoomController],
  providers: [RoomService],
})
export class RoomModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('room');
  }
}
