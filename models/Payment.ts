import mongoose, { Schema, Document } from "mongoose";

export interface IPayment extends Document {
  reference: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  amount: number;
  status: "pending" | "paid" | "failed";
  monnifyReference?: string;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    reference: { type: String, required: true, unique: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerPhone: { type: String, required: true },
    amount: { type: Number, required: true, default: 7000 },
    status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    monnifyReference: { type: String },
    paidAt: { type: Date },
  },
  { timestamps: true }
);

export const Payment =
  mongoose.models.Payment ||
  mongoose.model<IPayment>("Payment", PaymentSchema);
