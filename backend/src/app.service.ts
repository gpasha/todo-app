import { Injectable } from '@nestjs/common'

@Injectable()
export class AppService {
  getHello(): string {
    return 'TODO Backend API is running! 🚀'
  }
}
