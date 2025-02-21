import { Injectable } from '@nestjs/common';
import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { Job, Queue } from 'bull';
import axios from 'axios';

@Injectable()
@Processor('webhook-queue')
export class RelayService {
    constructor(@InjectQueue('webhook-queue') private webhookQueue: Queue) {}

    @Process('process-webhook')
    async handleWebhook(job: Job) {
        const webhookData = job.data;
        console.log(`Processing webhook:`, webhookData);

        try {
            const response = await axios.post(process.env.INTERNAL_SERVICE_URL, webhookData);
            console.log('✅ Webhook successfully relayed:', response.status);
        } catch (error) {
            console.error('Error forwarding webhook:', error.message);

            if (job.attemptsMade < Number(process.env.MAX_RETRIES)) {
                console.log(`Retrying in ${process.env.RETRY_DELAY} ms`);
                await job.retry();
            } else {
                console.log('Max retries reached, dropping webhook.');
            }
        }
    }
}
