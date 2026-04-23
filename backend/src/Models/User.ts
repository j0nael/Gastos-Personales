import { Schema, model, Document } from "mongoose";

export interface User extends Document {
  name: string;
  email: string;
  password: string;
  balance: number;
}

const userSchema = new Schema<User>(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        balance: { type: Number, default: 0 }
    },
    {
        timestamps: true
    }
);

export default model<User>("User", userSchema);