import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { connectDB } from "@/lib/mongodb";
import { initializePayment } from "@/lib/monnify";
import { Payment } from "@/models/Payment";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { customerName, customerEmail, customerPhone } = body;

    if (!customerName || !customerEmail || !customerPhone) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const reference = `SLH-${uuidv4().replace(/-/g, "").slice(0, 12).toUpperCase()}`;
    const amount = 7000;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Save pending payment to DB
    await Payment.create({
      reference,
      customerName,
      customerEmail,
      customerPhone,
      amount,
      status: "pending",
    });

    // Initialize with Monnify
    const monnifyData = await initializePayment({
      amount,
      customerName,
      customerEmail,
      customerPhone,
      reference,
      redirectUrl: `${appUrl}/payment/verify?ref=${reference}`,
    });

    return NextResponse.json({
      success: true,
      checkoutUrl: monnifyData.checkoutUrl,
      reference,
    });
  } catch (err: unknown) {
    console.error("Payment init error:", err);
    const message = err instanceof Error ? err.message : "Payment initialization failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
