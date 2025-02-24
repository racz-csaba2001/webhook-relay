import { Injectable } from '@nestjs/common';
import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { Job, Queue } from 'bull';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
@Processor('webhook-queue')
export class RelayService {
  private internalServiceUrl: string;
  private retryDelay: number;
  private maxRetries: number;

  constructor(
    @InjectQueue('webhook-queue') private webhookQueue: Queue,
    private configService: ConfigService,
  ) {
    this.internalServiceUrl = this.configService.get<string>(
      'INTERNAL_SERVICE_URL',
      'http://localhost:4000',
    );
    this.retryDelay = this.configService.get<number>('RETRY_DELAY', 5000);
    this.maxRetries = this.configService.get<number>('MAX_RETRIES', 3);
  }

  @Process('process-webhook')
  async handleWebhook(job: Job) {
    const webhookData = job.data;
    console.log(`Processing webhook:`, webhookData);

    try {
      const response = await axios.post(this.internalServiceUrl, webhookData);
      console.log('Webhook successfully relayed:', response.status);
    } catch (error) {
      console.error('Error forwarding webhook:', error.message);

      if (job.attemptsMade < this.maxRetries) {
        console.log(`Retrying in ${this.retryDelay} ms`);
        await new Promise((resolve) => setTimeout(resolve, this.retryDelay));
        await job.retry();
      } else {
        console.log('Max retries reached, dropping webhook.');
      }
    }
  }
}
