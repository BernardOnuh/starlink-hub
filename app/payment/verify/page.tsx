"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import styles from "./verify.module.css";

interface PaymentData {
  reference: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  status: string;
  paidAt?: string;
}

function VerifyContent() {
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref") || searchParams.get("paymentReference");
  const [status, setStatus] = useState<"loading" | "paid" | "failed" | "pending">("loading");
  const [payment, setPayment] = useState<PaymentData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!ref) { setError("No payment reference found."); setStatus("failed"); return; }
    const verify = async () => {
      try {
        const res = await fetch(`/api/verify-payment?ref=${ref}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setPayment(data.payment);
        setStatus(data.status);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Verification failed");
        setStatus("failed");
      }
    };
    verify();
  }, [ref]);

  return (
    <main className={styles.main}>
      <div className={styles.bg}><div className={styles.orb} /></div>
      <div className={styles.container}>
        <div className={styles.logo}>
          <span>⬡</span> StarLink Hub
        </div>

        <div className={styles.card}>
          {status === "loading" && (
            <div className={styles.center}>
              <div className={styles.spinner} />
              <p className={styles.loadingText}>Verifying your payment…</p>
            </div>
          )}

          {status === "paid" && payment && (
            <div className={`${styles.center} animate-in`}>
              <div className={styles.iconSuccess}>✓</div>
              <h1 className={styles.title}>Payment Successful!</h1>
              <p className={styles.subtitle}>Your Starlink service has been activated.</p>
              <div className={styles.details}>
                <div className={styles.row}><span>Name</span><span>{payment.customerName}</span></div>
                <div className={styles.row}><span>Email</span><span>{payment.customerEmail}</span></div>
                <div className={styles.row}><span>Amount</span><span className={styles.amount}>₦{payment.amount.toLocaleString()}</span></div>
                <div className={styles.row}><span>Reference</span><span className={styles.ref}>{payment.reference}</span></div>
                {payment.paidAt && (
                  <div className={styles.row}><span>Date</span><span>{new Date(payment.paidAt).toLocaleString("en-NG")}</span></div>
                )}
              </div>
              <a href="/" className={styles.btn}>← Make Another Payment</a>
            </div>
          )}

          {status === "pending" && (
            <div className={`${styles.center} animate-in`}>
              <div className={styles.iconPending}>⏳</div>
              <h1 className={styles.title}>Payment Pending</h1>
              <p className={styles.subtitle}>We're waiting for confirmation from your bank. This usually takes a few minutes.</p>
              <p className={styles.ref}>Ref: {ref}</p>
              <button className={styles.btn} onClick={() => { setStatus("loading"); window.location.reload(); }}>
                Check Again
              </button>
            </div>
          )}

          {status === "failed" && (
            <div className={`${styles.center} animate-in`}>
              <div className={styles.iconFailed}>✕</div>
              <h1 className={styles.title}>Payment Failed</h1>
              <p className={styles.subtitle}>{error || "Your payment could not be completed. Please try again."}</p>
              <a href="/" className={styles.btn}>Try Again</a>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function VerifyPage() {
  return <Suspense fallback={<div style={{color:"#fff",textAlign:"center",padding:"80px"}}>Loading…</div>}><VerifyContent /></Suspense>;
}
