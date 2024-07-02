import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class GatewayService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}
}
