import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { verifyPayment } from "@/lib/monnify";
import { Payment } from "@/models/Payment";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const ref = req.nextUrl.searchParams.get("ref");
    if (!ref) {
      return NextResponse.json({ error: "Reference required" }, { status: 400 });
    }

    const payment = await Payment.findOne({ reference: ref });
    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // If already confirmed, return cached status
    if (payment.status === "paid") {
      return NextResponse.json({ success: true, status: "paid", payment });
    }

    // Verify with Monnify
    const monnifyData = await verifyPayment(ref);
    const isPaid = monnifyData.paymentStatus === "PAID";

    if (isPaid) {
      payment.status = "paid";
      payment.paidAt = new Date();
      payment.monnifyReference = monnifyData.transactionReference;
      await payment.save();
    } else if (monnifyData.paymentStatus === "FAILED" || monnifyData.paymentStatus === "CANCELLED") {
      payment.status = "failed";
      await payment.save();
    }

    return NextResponse.json({
      success: true,
      status: payment.status,
      payment: {
        reference: payment.reference,
        customerName: payment.customerName,
        customerEmail: payment.customerEmail,
        amount: payment.amount,
        status: payment.status,
        paidAt: payment.paidAt,
      },
    });
  } catch (err: unknown) {
    console.error("Verify error:", err);
    const message = err instanceof Error ? err.message : "Verification failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
