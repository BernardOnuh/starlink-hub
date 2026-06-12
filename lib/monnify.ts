import axios from "axios";

const BASE_URL = process.env.MONNIFY_BASE_URL || "https://sandbox.monnify.com";
const API_KEY = process.env.MONNIFY_API_KEY!;
const SECRET_KEY = process.env.MONNIFY_SECRET_KEY!;

export async function getMonnifyToken(): Promise<string> {
  const credentials = Buffer.from(`${API_KEY}:${SECRET_KEY}`).toString("base64");
  const response = await axios.post(
    `${BASE_URL}/api/v1/auth/login`,
    {},
    { headers: { Authorization: `Basic ${credentials}` } }
  );
  return response.data.responseBody.accessToken;
}

export async function initializePayment(payload: {
  amount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  reference: string;
  redirectUrl: string;
}) {
  const token = await getMonnifyToken();
  const response = await axios.post(
    `${BASE_URL}/api/v1/merchant/transactions/init-transaction`,
    {
      amount: payload.amount,
      customerName: payload.customerName,
      customerEmail: payload.customerEmail,
      customerPhone: payload.customerPhone,
      paymentReference: payload.reference,
      paymentDescription: "Starlink Service & Maintenance - 7,000 NGN",
      currencyCode: "NGN",
      contractCode: process.env.MONNIFY_CONTRACT_CODE,
      redirectUrl: payload.redirectUrl,
      paymentMethods: ["CARD", "ACCOUNT_TRANSFER", "USSD"],
    },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data.responseBody;
}

export async function verifyPayment(reference: string) {
  const token = await getMonnifyToken();
  const encodedRef = encodeURIComponent(reference);
  const response = await axios.get(
    `${BASE_URL}/api/v1/merchant/transactions/query?paymentReference=${encodedRef}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data.responseBody;
}
