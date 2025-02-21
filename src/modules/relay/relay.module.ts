import { Module } from '@nestjs/common';
import { RelayService } from './relay.service';

@Module({
  providers: [RelayService]
})
export class RelayModule {}
