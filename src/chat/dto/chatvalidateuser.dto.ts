import mongoose from 'mongoose';

export class ChatValidateUser {
  chatId: string;
  userId: mongoose.Schema.Types.ObjectId;
}
