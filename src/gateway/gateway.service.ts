import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class GatewayService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async setUserActive(_id: string): Promise<void> {
    const user = await this.userModel.findOne({ _id });
    user.isActive = true;

    await user.save();
  }

  async setUserInActive(_id: string): Promise<void> {
    const user = await this.userModel.findOne({ _id });
    user.isActive = false;

    await user.save();
  }
}
