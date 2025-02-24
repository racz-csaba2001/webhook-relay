import { Injectable } from '@nestjs/common';
import {
  BullQueueEvents,
  OnQueueActive,
  OnQueueError,
  OnQueueEvent,
  OnQueueFailed,
  Process,
  Processor,
} from '@nestjs/bull';
import { Job } from 'bull';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
@Processor('webhook-queue')
export class RelayService {
  private internalServiceUrl: string;

  constructor(private configService: ConfigService) {
    this.internalServiceUrl = this.configService.get<string>(
      'INTERNAL_SERVICE_URL',
      'http://localhost:3000',
    );
  }

  @OnQueueActive()
  onActive(job: Job) {
    console.log(
      `RELAY SERVICE: Processing job ${job.id} of type ${job.name} with data ${job.data}...`,
    );
  }

  @Process('process-webhook')
  async handleWebhook(job: Job) {
    const webhookData = job?.data;

    const response = await axios.post(this.internalServiceUrl, webhookData, {
      validateStatus: (status) => status < 500,
    });

    console.log(
      'RELAY SERVICE: Webhook successfully relayed:',
      response?.status,
    );
  }

  @OnQueueEvent(BullQueueEvents.COMPLETED)
  onCompleted(job: Job) {
    console.log(
      `RELAY SERVICE: Completed job ${job.id} of type ${job.name} with result ${job.returnvalue}`,
    );
  }

  @OnQueueFailed()
  onFailed(job: Job) {
    console.log(`RELAY SERVICE: Failed job ${job.id} of type ${job.name}`);
  }

  @OnQueueError()
  onError(job: Job | string) {
    if (typeof job === 'string') {
      console.log(`RELAY SERVICE: Error in running job: ${job}`);
    } else {
      console.log(`RELAY SERVICE: Error job ${job.id} of type ${job.name}`);
    }
  }
}
