# 🍽️ Food Stall — Digital Ordering System

A complete QR-based food ordering system built with **Next.js 15**, **Tailwind CSS**, and **Razorpay**.

## Features

- 📱 **Customer Menu** — Scan QR → browse items → add to cart
- 💳 **Checkout** — Pay via Razorpay (UPI / Card / Net Banking / Wallets)
- 💬 **WhatsApp Bill** — Order summary sent to customer on WhatsApp (free, no API)
- 📊 **Stall Dashboard** — Live order updates, status workflow, bell notification
- 📷 **QR Generator** — Generate & download printable QR code for your stall

## Tech Stack (all free / open source)

| Tool | Purpose |
|---|---|
| Next.js 15 (App Router) | Framework |
| Tailwind CSS | Styling |
| qrcode.react | QR code generation |
| Razorpay (test mode) | Payments |
| WhatsApp wa.me links | Bill delivery |
| BroadcastChannel + localStorage | Real-time dashboard |

## Getting Started

```bash
# Install dependencies
npm install

# Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Setup Razorpay

In `src/app/checkout/page.tsx`, replace:

```ts
const RAZORPAY_KEY = "rzp_test_YourKeyHere";
```

with your test key from [razorpay.com/dashboard](https://razorpay.com/dashboard).  
Until then the app runs in **demo mode** automatically.

## Routes

| Route | Description |
|---|---|
| `/` | Home hub |
| `/menu` | Customer-facing menu |
| `/checkout` | Cart + payment |
| `/confirmation` | Order confirmed + WhatsApp |
| `/dashboard` | Stall owner dashboard |
| `/qr-generator` | Generate QR code |

## Deploy for Free

- **Vercel** — `vercel deploy` (recommended for Next.js)
- **Netlify** — connect GitHub repo
- **GitHub Pages** — export as static (`next export`)
