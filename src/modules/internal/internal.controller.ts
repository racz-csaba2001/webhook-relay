import { Controller, Post, Body } from '@nestjs/common';

@Controller('internal-service')
export class InternalController {
  @Post()
  async handleInternal(@Body() payload: any) {
    const rand = Math.random();

    if (rand < 0.3) {
      const errors = [400, 500, 502, 503];
      const status = errors[Math.floor(Math.random() * errors.length)];
      console.log(`Internal Service failed with status: ${status}`);
      return { error: `HTTP ${status}` };
    }

    const delayChance = Math.random();
    if (delayChance < 0.3) {
      const delay = Math.floor(Math.random() * 30000);
      console.log(`Delaying response for ${delay} ms`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    console.log('Internal Service successfully processed:', payload);
    return { success: true };
  }
}
