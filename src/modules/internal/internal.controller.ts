import { Controller, Post, Body, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller('internal-service')
export class InternalController {
  @Post()
  async handleInternal(@Body() payload: any, @Res() resp: Response) {
    const rand = Math.random();

    if (rand < 0.3) {
      const errors = [400, 500, 502, 503];
      const status = errors[Math.floor(Math.random() * errors.length)];
      console.log(`INTERNAL SERVICE: failed with status: ${status}`);
      return resp
        .status(status)
        .send(`Internal Service failed with status: ${status}`);
    }

    const delayChance = Math.random();
    if (delayChance < 0.3) {
      const delay = Math.floor(Math.random() * 30000);
      console.log(`INTERNAL SERVICE: Delaying response for ${delay} ms`);
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log('INTERNAL SERVICE: successfully processed:', payload);
    return resp.send({ success: true });
  }
}
