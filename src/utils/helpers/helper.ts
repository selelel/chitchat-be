import mongoose from 'mongoose';

export const convertStringToObjectId = (
  str: string,
): mongoose.Schema.Types.ObjectId => {
  return str as unknown as mongoose.Schema.Types.ObjectId;
};
