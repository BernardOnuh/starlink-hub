import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/mongodb";
import { Payment } from "@/models/Payment";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("monnify-signature");
    const secretKey = process.env.MONNIFY_SECRET_KEY!;

    // Verify webhook signature
    const computedHash = crypto
      .createHmac("sha512", secretKey)
      .update(body)
      .digest("hex");

    if (computedHash !== signature) {
      console.warn("Invalid webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    await connectDB();
    const data = JSON.parse(body);
    const { eventData } = data;

    if (!eventData) return NextResponse.json({ ok: true });

    const reference = eventData.paymentReference;
    const payment = await Payment.findOne({ reference });
    if (!payment) return NextResponse.json({ ok: true });

    if (eventData.paymentStatus === "PAID") {
      payment.status = "paid";
      payment.paidAt = new Date();
      payment.monnifyReference = eventData.transactionReference;
      await payment.save();
    } else if (["FAILED", "CANCELLED", "REVERSED"].includes(eventData.paymentStatus)) {
      payment.status = "failed";
      await payment.save();
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
