import Mongoose, { Schema } from 'mongoose';

export const chatSchema = new Schema(
  {
    chatId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    typing: {
      type: Boolean,
      required: false,
    },
    isFriend: {
      type: Boolean,
      required: true,
    },
    status: {
      type: String,
      enum: ['valid', 'block', 'permission_needed'],
      required: true,
    },
    mute: {
      is: {
        type: Boolean,
        required: true,
      },
      until: {
        type: Date,
        required: true,
      },
    },
  },
  { _id: false },
);

export class CreateChatDto {}
