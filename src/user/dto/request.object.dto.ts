import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { User } from '../entities/user.entity';

@Schema()
@ObjectType()
export class RequestObjectDto {
  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
  @Field(() => [User])
  toFollowings: mongoose.Schema.Types.ObjectId[];

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
  @Field(() => [User])
  toFollowers: mongoose.Schema.Types.ObjectId[];
}

export const defaultRequestObjectDto = {
  toFollowings: [],
  toFollowers: [],
};
