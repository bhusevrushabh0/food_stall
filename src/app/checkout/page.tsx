"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { MENU } from "@/lib/menu";
import { getCartItems, calcSubtotal, calcGST, calcTotal, totalItemCount } from "@/lib/cart";
import { saveOrder } from "@/lib/orders";
import { Order } from "@/lib/types";
import PageHeader from "@/components/PageHeader";
import QtyControl from "@/components/QtyControl";
import VegDot from "@/components/VegDot";

// Extend window for Razorpay
declare global {
  interface Window {
    Razorpay: new (opts: RazorpayOptions) => { open(): void };
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  image?: string;
  handler: (response: { razorpay_payment_id: string }) => void;
  prefill?: { name?: string; contact?: string };
  theme?: { color?: string };
  modal?: { ondismiss?: () => void };
}

// ── Replace with your Razorpay test key ──────────────────
const RAZORPAY_KEY = "rzp_test_YourKeyHere";

export default function CheckoutPage() {
  const { cart, addItem, removeItem, clearCart } = useCart();
  const router = useRouter();

  const [name, setName]   = useState("");
  const [wa, setWa]       = useState("");
  const [note, setNote]   = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const items    = getCartItems(cart, MENU);
  const subtotal = calcSubtotal(items);
  const gst      = calcGST(subtotal);
  const total    = calcTotal(subtotal, gst);
  const count    = totalItemCount(cart);

  function validate() {
    const e: Record<string, string> = {};
    if (!name.trim())               e.name = "Name is required";
    if (!wa.trim() || wa.length < 10) e.wa = "Enter a valid 10-digit WhatsApp number";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function buildOrder(paymentId: string): Order {
    return {
      orderId:   "ORD-" + Date.now(),
      name:      name.trim(),
      whatsapp:  wa.trim(),
      note:      note.trim(),
      items,
      subtotal,
      gst,
      total,
      status:    "paid",
      paymentId,
      timestamp: new Date().toISOString(),
    };
  }

  function onPaymentSuccess(paymentId: string) {
    const order = buildOrder(paymentId);
    saveOrder(order);
    clearCart();
    router.push(`/confirmation?orderId=${order.orderId}`);
  }

  function initiatePayment() {
    if (!validate()) return;
    setLoading(true);

    const launchRazorpay = () => {
      const opts: RazorpayOptions = {
        key:         RAZORPAY_KEY,
        amount:      total * 100,
        currency:    "INR",
        name:        "Shree Food Stall",
        description: `${count} item${count > 1 ? "s" : ""}`,
        image:       "https://cdn-icons-png.flaticon.com/512/3652/3652191.png",
        handler:     (res) => onPaymentSuccess(res.razorpay_payment_id),
        prefill:     { name, contact: "91" + wa },
        theme:       { color: "#ff6b35" },
        modal: {
          ondismiss: () => setLoading(false),
        },
      };

      try {
        new window.Razorpay(opts).open();
      } catch {
        // Demo mode — Razorpay key not configured
        onPaymentSuccess("DEMO-" + Date.now());
      }
    };

    // Inject Razorpay script if not already loaded
    if (typeof window.Razorpay !== "undefined") {
      launchRazorpay();
    } else {
      const s = document.createElement("script");
      s.src = "https://checkout.razorpay.com/v1/checkout.js";
      s.onload = launchRazorpay;
      s.onerror = () => {
        // No network / not configured — demo mode
        onPaymentSuccess("DEMO-" + Date.now());
      };
      document.head.appendChild(s);
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-stall-bg">
        <PageHeader title="Your Order" />
        <div className="flex flex-col items-center justify-center py-24 text-gray-400">
          <span className="text-6xl mb-4">🛒</span>
          <p className="text-base">Your cart is empty.</p>
          <button
            onClick={() => router.push("/menu")}
            className="mt-4 text-primary font-semibold"
          >
            Browse Menu →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stall-bg pb-10">
      <PageHeader title="Your Order" />

      <div className="max-w-lg mx-auto px-4 pt-5 flex flex-col gap-4">

        {/* Cart items */}
        <Card title="🛒 Your Items">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-none">
              <span className="text-2xl w-8 text-center">{item.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm flex items-center">
                  <VegDot veg={item.veg} />{item.name}
                </p>
                <p className="text-xs text-gray-400">₹{item.price} × {item.qty}</p>
              </div>
              <QtyControl
                qty={item.qty}
                onAdd={() => addItem(item.id)}
                onRemove={() => removeItem(item.id)}
                size="sm"
              />
              <span className="text-sm font-bold text-primary w-14 text-right">
                ₹{item.price * item.qty}
              </span>
            </div>
          ))}
        </Card>

        {/* Bill */}
        <Card title="🧾 Bill Summary">
          <BillRow label={`Subtotal (${count} items)`} value={`₹${subtotal}`} />
          <BillRow label="GST (5%)"                    value={`₹${gst}`} />
          <BillRow label="Packaging"                   value="₹0" />
          <div className="flex justify-between font-bold text-base pt-3 mt-2 border-t-2 border-dashed border-gray-200">
            <span>Total Payable</span>
            <span className="text-primary">₹{total}</span>
          </div>
        </Card>

        {/* Customer details */}
        <Card title="📱 Your Details">
          <Field
            label="Name"
            required
            error={errors.name}
          >
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className={inputCls(!!errors.name)}
            />
          </Field>

          <Field
            label="WhatsApp Number"
            required
            error={errors.wa}
            hint="📩 Order summary & bill will be sent on WhatsApp"
          >
            <input
              type="tel"
              value={wa}
              onChange={(e) => setWa(e.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder="e.g. 9876543210"
              className={inputCls(!!errors.wa)}
            />
          </Field>

          <Field label="Special Instructions">
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. No onions, extra spicy…"
              className={inputCls(false)}
            />
          </Field>
        </Card>

        {/* Pay button */}
        <button
          onClick={initiatePayment}
          disabled={loading}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-orange-400 text-white font-bold text-lg
            shadow-[0_4px_16px_rgba(255,107,53,0.4)] hover:opacity-90 active:scale-[0.98] transition-all
            disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          {loading ? (
            <>
              <span className="w-5 h-5 border-[3px] border-white/40 border-t-white rounded-full animate-spin" />
              Processing…
            </>
          ) : (
            `Pay ₹${total} via Razorpay`
          )}
        </button>

        <p className="text-center text-xs text-gray-400">
          🔒 Secured by <strong>Razorpay</strong> — UPI · Cards · Net Banking · Wallets
        </p>
      </div>
    </div>
  );
}

/* ── Small helpers ─────────────────────────────────────── */
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <p className="text-sm font-bold text-primary mb-4">{title}</p>
      {children}
    </div>
  );
}

function BillRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm text-gray-500 py-1">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function Field({
  label, required, hint, error, children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4 last:mb-0">
      <label className="block text-xs font-semibold text-gray-500 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint  && !error && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

function inputCls(hasError: boolean) {
  return `w-full px-4 py-3 rounded-xl border-[1.5px] text-sm bg-gray-50 outline-none transition
    focus:bg-white focus:border-primary
    ${hasError ? "border-red-400 bg-red-50" : "border-gray-200"}`;
}
