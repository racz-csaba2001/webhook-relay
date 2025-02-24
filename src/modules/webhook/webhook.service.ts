import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class WebhookService {
  constructor(@InjectQueue('webhook-queue') private webhookQueue: Queue) {}

  async enqueueWebhook(payload: any) {
    await this.webhookQueue.add('process-webhook', payload);
    console.log('RELAY SERVICE: Webhook enqueued:', payload);
  }
}
