"use client";
import { useState, useEffect, useRef } from "react";
import styles from "./page.module.css";

interface TimeLeft {
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
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
  const [focused, setFocused] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Starfield canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const stars = Array.from({ length: 160 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.2 + 0.2,
      o: Math.random() * 0.6 + 0.1,
      speed: Math.random() * 0.25 + 0.05,
    }));

    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach((s) => {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180, 230, 255, ${s.o})`;
        ctx.fill();
        s.y += s.speed;
        if (s.y > canvas.height) { s.y = 0; s.x = Math.random() * canvas.width; }
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const today = new Date();
      const currentDay = today.getDate();
      let targetDate;
      if (currentDay < 10) {
        targetDate = new Date(today.getFullYear(), today.getMonth(), 10, 23, 59, 59);
      } else {
        targetDate = new Date(today.getFullYear(), today.getMonth() + 1, 10, 23, 59, 59);
      }
      const distance = targetDate.getTime() - new Date().getTime();
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
        const seconds = Math.floor((distance / 1000) % 60);
        setTimeLeft({ days, hours, minutes, seconds, text: "", expired: false });
      }
    };
    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async () => {
    if (!form.customerName || !form.customerEmail || !form.customerPhone) {
      setError("All fields are required to proceed.");
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

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <main className={styles.main}>
      {/* Starfield */}
      <canvas ref={canvasRef} className={styles.starfield} />

      {/* Background atmosphere */}
      <div className={styles.bg}>
        <div className={styles.nebula1} />
        <div className={styles.nebula2} />
        <div className={styles.nebula3} />
        <div className={styles.scanline} />
      </div>

      <div className={styles.container}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.logo}>
            <div className={styles.logoOrbit}>
              <div className={styles.logoCore}>⬡</div>
              <div className={styles.orbitRing} />
            </div>
            <div className={styles.logoTextGroup}>
              <span className={styles.logoText}>StarLink Hub</span>
              <span className={styles.logoSub}>Satellite Network</span>
            </div>
          </div>
          <div className={styles.headerBadge}>
            <span className={styles.pulseDot} />
            LIVE NETWORK
          </div>
        </header>

        <div className={styles.content}>
          {/* Left */}
          <div className={styles.left}>
            <div className={styles.eyebrow}>
              <span className={styles.eyebrowLine} />
              SATELLITE INTERNET SERVICE
              <span className={styles.eyebrowLine} />
            </div>

            <h1 className={styles.headline}>
              <span className={styles.headlineTop}>STAY</span>
              <span className={styles.headlineMid}>CONNECTED</span>
              <span className={styles.headlineBottom}>
                AT <em className={styles.accentItalic}>WEB3NOVA</em>
              </span>
            </h1>

            <p className={styles.subtext}>
              High-speed satellite internet with zero ground infrastructure.
              Lock in the early rate before the 10th — prices increase after.
            </p>

            {/* Pricing comparison */}
            <div className={styles.pricingBlock}>
              <div className={`${styles.priceCard} ${currentPrice === 5000 ? styles.priceCardActive : styles.priceCardDim}`}>
                <div className={styles.priceCardEye}>NOW</div>
                <div className={styles.priceCardAmount}>₦5,000</div>
                <div className={styles.priceCardLabel}>Before 10th</div>
                {currentPrice === 5000 && <div className={styles.priceCardGlow} />}
              </div>
              <div className={styles.priceDivider}>
                <div className={styles.priceDividerLine} />
                <div className={styles.priceDividerArrow}>→</div>
                <div className={styles.priceDividerLine} />
              </div>
              <div className={`${styles.priceCard} ${currentPrice === 7000 ? styles.priceCardActive : styles.priceCardDim}`}>
                <div className={styles.priceCardEye}>AFTER</div>
                <div className={styles.priceCardAmountAlt}>₦7,000</div>
                <div className={styles.priceCardLabel}>From 10th</div>
              </div>
            </div>

            {/* Countdown */}
            {!timeLeft.expired && (
              <div className={styles.countdown}>
                <div className={styles.countdownHeader}>
                  <span className={styles.countdownIcon}>◈</span>
                  <span className={styles.countdownTitle}>LOCKED RATE EXPIRES IN</span>
                </div>
                <div className={styles.countdownUnits}>
                  {[
                    { val: timeLeft.days ?? 0, label: "DAYS" },
                    { val: timeLeft.hours ?? 0, label: "HRS" },
                    { val: timeLeft.minutes ?? 0, label: "MIN" },
                    { val: timeLeft.seconds ?? 0, label: "SEC" },
                  ].map((u, i) => (
                    <div key={u.label} className={styles.countdownUnit}>
                      <div className={styles.countdownDigit}>{pad(u.val)}</div>
                      <div className={styles.countdownLabel}>{u.label}</div>
                      {i < 3 && <div className={styles.countdownColon}>:</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Features */}
            <div className={styles.features}>
              {[
                { icon: "◉", label: "Monthly Subscription" },
                { icon: "◈", label: "Secure Payment" },
                { icon: "◎", label: "24/7 Support" },
                { icon: "◌", label: "Nationwide Coverage" },
              ].map((f) => (
                <div key={f.label} className={styles.feature}>
                  <span className={styles.featureIcon}>{f.icon}</span>
                  <span className={styles.featureLabel}>{f.label}</span>
                </div>
              ))}
            </div>

            <div className={styles.savingsTag}>
              ▲ SAVE ₦2,000/MONTH — ACT BEFORE THE 10TH
            </div>
          </div>

          {/* Right – Form */}
          <div className={styles.right}>
            <div className={styles.formCard}>
              {/* Form card corner accents */}
              <div className={`${styles.corner} ${styles.cornerTL}`} />
              <div className={`${styles.corner} ${styles.cornerTR}`} />
              <div className={`${styles.corner} ${styles.cornerBL}`} />
              <div className={`${styles.corner} ${styles.cornerBR}`} />

              <div className={styles.formHeader}>
                <div className={styles.formTitleGroup}>
                  <p className={styles.formEyebrow}>SUBSCRIPTION PORTAL</p>
                  <h2 className={styles.formTitle}>Complete Your<br />Payment</h2>
                </div>
                <div className={styles.formAmount}>
                  <span className={styles.formAmountLabel}>MONTHLY FEE</span>
                  <span className={styles.formAmountValue}>
                    ₦{currentPrice.toLocaleString()}
                  </span>
                  {isPriceIncreased && (
                    <span className={styles.priceUp}>↑ RATE ADJUSTED</span>
                  )}
                </div>
              </div>

              <div className={styles.formDivider} />

              {["customerName", "customerEmail", "customerPhone"].map((name) => (
                <div key={name} className={`${styles.formGroup} ${focused === name ? styles.formGroupFocused : ""}`}>
                  <label className={styles.label}>
                    {name === "customerName" ? "FULL NAME" : name === "customerEmail" ? "EMAIL ADDRESS" : "PHONE NUMBER"}
                  </label>
                  <div className={styles.inputWrap}>
                    <input
                      name={name}
                      type={name === "customerEmail" ? "email" : "text"}
                      placeholder={
                        name === "customerName" ? "Chukwuemeka Obi"
                          : name === "customerEmail" ? "you@example.com"
                          : "08012345678"
                      }
                      value={form[name as keyof typeof form]}
                      onChange={handleChange}
                      onFocus={() => setFocused(name)}
                      onBlur={() => setFocused(null)}
                      className={styles.input}
                    />
                    <div className={styles.inputBorder} />
                  </div>
                </div>
              ))}

              {error && (
                <div className={styles.error}>
                  <span className={styles.errorIcon}>⚠</span> {error}
                </div>
              )}

              <button
                className={`${styles.submitBtn} ${currentPrice === 5000 ? styles.submitPrimary : styles.submitSecondary}`}
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <span className={styles.loadingSpinner}>PROCESSING...</span>
                ) : currentPrice === 5000 ? (
                  <>LOCK IN AT ₦5,000 <span className={styles.btnArrow}>→</span></>
                ) : (
                  <>PAY ₦{currentPrice.toLocaleString()} <span className={styles.btnArrow}>→</span></>
                )}
                <div className={styles.btnShine} />
              </button>

              <div className={styles.formFooter}>
                <span className={styles.footerItem}>🔐 Powered by Monnify</span>
                <span className={styles.footerDot}>·</span>
                <span className={styles.footerItem}>Card · Transfer · USSD</span>
              </div>
              <div className={styles.formFooter2}>
                Renews monthly &nbsp;·&nbsp; Cancel anytime
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}