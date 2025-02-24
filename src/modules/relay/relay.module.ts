import { Module } from '@nestjs/common';
import { RelayService } from './relay.service';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'webhook-queue',
    }),
  ],
  providers: [RelayService],
})
export class RelayModule {}
