import mongoose, { ObjectId } from "mongoose";
import { User } from "src/user/entities/user.entity";

interface JWTHeader {
    alg: string;
    typ: string;
  }


export  interface JWTPayload {
    _id: mongoose.Schema.Types.ObjectId;
    provider?: "jwt" | "google";
    iat: number;
    exp: number;
  }
  
export interface Decoded_JWT {
    header: JWTHeader;
    payload: JWTPayload;
    signature: string;
  }
  

export type GetCurrentUser = {
  decoded_token : Decoded_JWT,
  token: string
}

export type GoogleCurrentUserPayload = {
  user: User;
  refresh_token: string;
  decoded_token: Decoded_JWT;
  google_openid: string | null;
};
