"use client";
import { useState } from "react";
import styles from "./page.module.css";

export default function Home() {
  const [form, setForm] = useState({ customerName: "", customerEmail: "", customerPhone: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async () => {
    if (!form.customerName || !form.customerEmail || !form.customerPhone) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/initiate-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Payment failed");
      window.location.href = data.checkoutUrl;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <main className={styles.main}>
      {/* Background */}
      <div className={styles.bg}>
        <div className={styles.orb1} />
        <div className={styles.orb2} />
        <div className={styles.grid} />
      </div>

      <div className={styles.container}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>⬡</span>
            <span className={styles.logoText}>StarLink Hub</span>
          </div>
        </header>

        <div className={styles.content}>
          {/* Left */}
          <div className={styles.left}>
            <div className={styles.badge}>🛰️ Satellite Internet</div>
            <h1 className={styles.headline}>
              Stay Connected<br />
              <span className={styles.accent}> at Web3Nova</span>
            </h1>
            <p className={styles.subtext}>
              Pay securely for your Starlink service subscription and maintenance coverage. 
              One-time payment of ₦5,000 — fast, reliable, nationwide.
            </p>

            <div className={styles.features}>
              {[
                { icon: "⚡", label: "Instant Activation" },
                { icon: "🔒", label: "Secure Payment" },
                { icon: "🛠️", label: "Maintenance Included" },
                { icon: "📡", label: "Nationwide Coverage" },
              ].map((f) => (
                <div key={f.label} className={styles.feature}>
                  <span className={styles.featureIcon}>{f.icon}</span>
                  <span>{f.label}</span>
                </div>
              ))}
            </div>

            <div className={styles.amount}>
              <span className={styles.amountLabel}>One-time fee</span>
              <span className={styles.amountValue}>₦5,000</span>
            </div>
          </div>

          {/* Right – Form */}
          <div className={styles.right}>
            <div className={styles.formCard}>
              <h2 className={styles.formTitle}>Complete Your Payment</h2>
              <p className={styles.formSubtitle}>Enter your details to proceed to checkout</p>

              <div className={styles.formGroup}>
                <label className={styles.label}>Full Name</label>
                <input
                  name="customerName"
                  placeholder="e.g. Chukwuemeka Obi"
                  value={form.customerName}
                  onChange={handleChange}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Email Address</label>
                <input
                  name="customerEmail"
                  type="email"
                  placeholder="you@example.com"
                  value={form.customerEmail}
                  onChange={handleChange}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Phone Number</label>
                <input
                  name="customerPhone"
                  placeholder="08012345678"
                  value={form.customerPhone}
                  onChange={handleChange}
                />
              </div>

              {error && <p className={styles.error}>{error}</p>}

              <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
                {loading ? "Redirecting to payment..." : "Pay ₦5,000 →"}
              </button>

              <p className={styles.secureNote}>
                🔐 Powered by Monnify · Card, Transfer & USSD accepted
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
