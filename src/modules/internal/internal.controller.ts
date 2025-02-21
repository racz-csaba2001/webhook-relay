import { Controller, Post, Body } from '@nestjs/common';

@Controller('internal-service')
export class InternalController {
    @Post()
    handleInternal(@Body() payload: any) {
        const rand = Math.random();
        if (rand < 0.3) {
            const errors = [400, 500, 502, 503];
            const status = errors[Math.floor(Math.random() * errors.length)];
            throw new Error(`HTTP ${status}`);
        }

        console.log('Internal Service successfully processed:', payload);
        return { success: true };
    }
}
