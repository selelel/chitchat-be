import { Field, ObjectType } from '@nestjs/graphql';
import { Prop } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@ObjectType()
export class RequestObjectDto {
  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
  @Field(() => [String])
  toFollowings: mongoose.Schema.Types.ObjectId[];

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
  @Field(() => [String])
  toFollowers: mongoose.Schema.Types.ObjectId[];
}

export const defaultRequestObjectDto = {
  toFollowings: [],
  toFollowers: [],
};
