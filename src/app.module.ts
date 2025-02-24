import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { WebhookModule } from './modules/webhook/webhook.module';
import { RelayModule } from './modules/relay/relay.module';
import { InternalModule } from './modules/internal/internal.module';
import { BullModule } from '@nestjs/bull';
import { InternalController } from './modules/internal/internal.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_PORT) || 6379,
      },
    }),
    WebhookModule,
    RelayModule,
    InternalModule,
  ],
  controllers: [AppController, InternalController],
  providers: [AppService],
})
export class AppModule {}
