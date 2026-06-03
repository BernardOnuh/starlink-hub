"use client";
import { useState, useEffect } from "react";
import styles from "./page.module.css";

interface TimeLeft {
  days?: number;
  hours?: number;
  minutes?: number;
  text: string;
  expired: boolean;
}

export default function Home() {
  const [form, setForm] = useState({ customerName: "", customerEmail: "", customerPhone: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ text: "", expired: false });
  const [currentPrice, setCurrentPrice] = useState(5000);
  const [isPriceIncreased, setIsPriceIncreased] = useState(false);

  // Calculate time until 10th of current month or next month
  useEffect(() => {
    const calculateTimeLeft = () => {
      const today = new Date();
      const currentDay = today.getDate();
      
      let targetDate;
      if (currentDay < 10) {
        // Current month's 10th
        targetDate = new Date(today.getFullYear(), today.getMonth(), 10, 23, 59, 59);
      } else {
        // Next month's 10th
        targetDate = new Date(today.getFullYear(), today.getMonth() + 1, 10, 23, 59, 59);
      }

      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      if (distance < 0) {
        setIsPriceIncreased(true);
        setCurrentPrice(7000);
        setTimeLeft({ text: "Price has increased", expired: true });
      } else {
        setIsPriceIncreased(false);
        setCurrentPrice(5000);
        
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((distance / 1000 / 60) % 60);

        setTimeLeft({
          days,
          hours,
          minutes,
          text: `${days}d ${hours}h ${minutes}m`,
          expired: false
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

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
        body: JSON.stringify({ ...form, amount: currentPrice }),
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
              Reliable satellite internet with monthly subscription. Pay now at the special rate, 
              or the price increases on the 10th.
            </p>

            {/* Pricing Timeline */}
            <div className={styles.pricingTimeline}>
              <div className={styles.timelineItem + " " + (currentPrice === 5000 ? styles.active : "")}>
                <div className={styles.timelineIcon}>💰</div>
                <div className={styles.timelineContent}>
                  <div className={styles.timelineLabel}>Right Now</div>
                  <div className={styles.timelinePrice}>₦5,000</div>
                </div>
              </div>
              
              <div className={styles.timelineArrow}>→</div>
              
              <div className={styles.timelineItem + " " + (currentPrice === 7000 ? styles.active : "")}>
                <div className={styles.timelineIcon}>📅</div>
                <div className={styles.timelineContent}>
                  <div className={styles.timelineLabel}>From 10th</div>
                  <div className={styles.timelinePrice}>₦7,000</div>
                </div>
              </div>
            </div>

            {/* Countdown Timer */}
            {!timeLeft.expired && (
              <div className={styles.countdownCard}>
                <div className={styles.countdownLabel}>⏰ Locked Price Expires In</div>
                <div className={styles.countdown}>
                  <div className={styles.countdownItem}>
                    <span className={styles.countdownValue}>{timeLeft.days || 0}</span>
                    <span className={styles.countdownUnit}>Days</span>
                  </div>
                  <div className={styles.countdownItem}>
                    <span className={styles.countdownValue}>{timeLeft.hours || 0}</span>
                    <span className={styles.countdownUnit}>Hours</span>
                  </div>
                  <div className={styles.countdownItem}>
                    <span className={styles.countdownValue}>{timeLeft.minutes || 0}</span>
                    <span className={styles.countdownUnit}>Minutes</span>
                  </div>
                </div>
              </div>
            )}

            <div className={styles.features}>
              {[
                { icon: "✅", label: "Monthly Subscription" },
                { icon: "🔒", label: "Secure Payment" },
                { icon: "🛠️", label: "24/7 Support" },
                { icon: "📡", label: "Nationwide Coverage" },
              ].map((f) => (
                <div key={f.label} className={styles.feature}>
                  <span className={styles.featureIcon}>{f.icon}</span>
                  <span>{f.label}</span>
                </div>
              ))}
            </div>

            <div className={styles.savingsNote}>
              💡 Save ₦2,000/month by paying now instead of waiting until the 10th
            </div>
          </div>

          {/* Right – Form */}
          <div className={styles.right}>
            <div className={styles.formCard}>
              <h2 className={styles.formTitle}>Complete Your Payment</h2>
              <p className={styles.formSubtitle}>Start your monthly subscription today</p>

              {/* Amount Display */}
              <div className={styles.amountDisplayCard}>
                <span className={styles.amountDisplayLabel}>Monthly Fee</span>
                <span className={styles.amountDisplayValue}>₦{currentPrice.toLocaleString()}</span>
                {isPriceIncreased && (
                  <span className={styles.priceIncreasedNote}>Price increased on the 10th</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Full Name</label>
                <input
                  name="customerName"
                  placeholder="e.g. Chukwuemeka Obi"
                  value={form.customerName}
                  onChange={handleChange}
                  className={styles.input}
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
                  className={styles.input}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Phone Number</label>
                <input
                  name="customerPhone"
                  placeholder="08012345678"
                  value={form.customerPhone}
                  onChange={handleChange}
                  className={styles.input}
                />
              </div>

              {error && <p className={styles.error}>{error}</p>}

              <button 
                className={styles.submitBtn + " " + (currentPrice === 5000 ? styles.ctaPrimary : styles.ctaSecondary)} 
                onClick={handleSubmit} 
                disabled={loading}
              >
                {loading ? "Processing..." : currentPrice === 5000 ? `Lock In At ₦5,000 →` : `Pay ₦${currentPrice.toLocaleString()} →`}
              </button>

              <p className={styles.secureNote}>
                🔐 Powered by Monnify · Card, Transfer & USSD accepted
              </p>
              <p className={styles.subscriptionNote}>
                📅 Renews monthly. Cancel anytime.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}