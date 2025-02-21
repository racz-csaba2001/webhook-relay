import { Controller, Post, Body } from '@nestjs/common';
import { WebhookService } from './webhook.service';

@Controller('webhook')
export class WebhookController {
    constructor(private readonly webhookService: WebhookService) {}

    @Post()
    async receiveWebhook(@Body() payload: any) {
        console.log('📥 Webhook received:', payload);
        await this.webhookService.enqueueWebhook(payload);
        return { status: 'Webhook received' };
    }
}
