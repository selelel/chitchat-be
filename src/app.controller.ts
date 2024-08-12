import { Controller, Get } from '@nestjs/common';

@Controller('app')
export class AppController {
  constructor() {}

  @Get('status')
  async status(): Promise<{ status: string }> {
    return { status: "UP" };
  }
}
