# StarLink Hub – Payment Portal

A full-stack Next.js payment portal for Starlink service & maintenance (₦7,000), powered by **Monnify** and **MongoDB**.

---

## Stack
- **Next.js 14** (App Router, TypeScript)
- **MongoDB + Mongoose** (payment records)
- **Monnify** (payment gateway — card, bank transfer, USSD)

---

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment variables
Copy `.env.local.example` to `.env.local` and fill in your values:

```bash
cp .env.local.example .env.local
```

| Variable | Description |
|---|---|
| `MONGODB_URI` | Your MongoDB connection string |
| `MONNIFY_API_KEY` | From your Monnify dashboard |
| `MONNIFY_SECRET_KEY` | From your Monnify dashboard |
| `MONNIFY_CONTRACT_CODE` | From your Monnify dashboard |
| `MONNIFY_BASE_URL` | `https://sandbox.monnify.com` (test) or `https://api.monnify.com` (live) |
| `NEXT_PUBLIC_APP_URL` | Your deployed URL (e.g. `https://yourdomain.com`) |
| `JWT_SECRET` | Any long random string |

### 3. Run development server
```bash
npm run dev
```

### 4. Open in browser
- **Payment page**: http://localhost:3000
- **Admin dashboard**: http://localhost:3000/admin

---

## Pages

| Route | Description |
|---|---|
| `/` | Customer payment form |
| `/payment/verify?ref=REF` | Payment result page (redirect from Monnify) |
| `/admin` | Redirects to dashboard |
| `/admin/dashboard` | Payment records, stats, search & filter |

## API Routes

| Endpoint | Method | Description |
|---|---|---|
| `/api/initiate-payment` | POST | Create payment & get Monnify checkout URL |
| `/api/verify-payment?ref=REF` | GET | Verify payment status from Monnify |
| `/api/webhook` | POST | Monnify webhook (configure in Monnify dashboard) |
| `/api/admin/payments` | GET | Fetch payments list (paginated, filterable) |

---

## Monnify Webhook Setup
In your Monnify dashboard, set the webhook URL to:
```
https://yourdomain.com/api/webhook
```

---

## Going Live
1. Change `MONNIFY_BASE_URL` to `https://api.monnify.com`
2. Use your live Monnify API Key & Secret
3. Set `NEXT_PUBLIC_APP_URL` to your production domain
4. Deploy to Vercel: `vercel deploy`
