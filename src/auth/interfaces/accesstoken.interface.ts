import mongoose from 'mongoose';

export interface AccessTokenGeneration {
  _id: mongoose.Schema.Types.ObjectId;
  provider: 'jwt' | 'google';
  google_tkn ?: string
}
