import { Schema, model, Types, Document } from "mongoose";
import { category_transaction, type_transaction } from "./Enums";

export interface Transaction extends Document {
  user: Types.ObjectId;
  amount: number;
  category: category_transaction;
  type: type_transaction;
}

const transactionSchema = new Schema<Transaction>(
    {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        amount: { type: Number, required: true },
        category: { type: String, enum: Object.values(category_transaction), required: true },
        type: { type: String, enum: Object.values(type_transaction), required: true }
    },
    {
        timestamps: true
    }
);

export default model<Transaction>("Transaction", transactionSchema);