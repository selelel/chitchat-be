import mongoose from "mongoose";

export interface AccessTokenGeneration {
    _id: mongoose.Schema.Types.ObjectId,
    password?: string,
    provider: "jwt" | "google"
}