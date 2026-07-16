"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getOrderById, buildWAMessage } from "@/lib/orders";
import { Order } from "@/lib/types";
import VegDot from "@/components/VegDot";
import { Suspense } from "react";

function ConfirmationContent() {
  const params  = useSearchParams();
  const router  = useRouter();
  const orderId = params.get("orderId") ?? "";

  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    const found = getOrderById(orderId);
    if (found) setOrder(found);
  }, [orderId]);

  function fmtTime(ts: string) {
    return new Date(ts).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-stall-bg flex flex-col items-center justify-center text-gray-400">
        <span className="text-5xl mb-4">😕</span>
        <p>Order not found.</p>
        <button onClick={() => router.push("/menu")} className="mt-4 text-primary font-semibold">
          Back to Menu
        </button>
      </div>
    );
  }

  const waLink = `https://wa.me/91${order.whatsapp}?text=${buildWAMessage(order)}`;

  return (
    <div className="min-h-screen bg-stall-bg pb-10">
      {/* Success banner */}
      <div className="bg-gradient-to-br from-green-500 to-emerald-400 text-white text-center px-4 py-10">
        <div
          className="w-20 h-20 rounded-full bg-white/25 flex items-center justify-center text-4xl mx-auto mb-4"
          style={{ animation: "popIn 0.4s cubic-bezier(0.175,0.885,0.32,1.275) both" }}
        >
          ✓
        </div>
        <h1 className="text-2xl font-extrabold">Order Confirmed!</h1>
        <p className="text-sm opacity-90 mt-2">
          {order.orderId} · {fmtTime(order.timestamp)}
        </p>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-5 flex flex-col gap-4">

        {/* WhatsApp note */}
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex gap-3 items-start text-sm text-green-800">
          <span className="text-xl">💬</span>
          <div>
            <strong>Send your bill on WhatsApp</strong>
            <p className="text-xs text-green-600 mt-0.5">
              Tap the green button below to send your order summary to{" "}
              <strong>+91 {order.whatsapp}</strong>
            </p>
          </div>
        </div>

        {/* Order meta */}
        <Card title="📋 Order Details">
          <MetaRow label="Order ID"    value={order.orderId} />
          <MetaRow label="Name"        value={order.name} />
          <MetaRow label="WhatsApp"    value={`+91 ${order.whatsapp}`} />
          <MetaRow label="Time"        value={fmtTime(order.timestamp)} />
          <MetaRow label="Payment ID"  value={order.paymentId || "N/A"} small />
          <MetaRow label="Status"      value={
            <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">
              ✓ Paid
            </span>
          } />
          {order.note && <MetaRow label="Note" value={order.note} />}
        </Card>

        {/* Items */}
        <Card title="🛒 Items Ordered">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-none">
              <span className="text-2xl w-8 text-center">{item.emoji}</span>
              <div className="flex-1">
                <p className="text-sm font-semibold flex items-center">
                  <VegDot veg={item.veg} />{item.name}
                </p>
                <p className="text-xs text-gray-400">₹{item.price} × {item.qty}</p>
              </div>
              <span className="text-sm font-bold text-primary">₹{item.price * item.qty}</span>
            </div>
          ))}
        </Card>

        {/* Bill */}
        <Card title="🧾 Bill">
          <BillRow label="Subtotal" value={`₹${order.subtotal}`} />
          <BillRow label="GST (5%)" value={`₹${order.gst}`} />
          <div className="flex justify-between font-bold text-base pt-3 mt-2 border-t-2 border-dashed border-gray-200">
            <span>Total Paid</span>
            <span className="text-primary">₹{order.total}</span>
          </div>
        </Card>

        {/* WhatsApp button */}
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-4 rounded-2xl bg-[#25D366] text-white font-bold text-base
            flex items-center justify-center gap-3 shadow-[0_4px_16px_rgba(37,211,102,0.35)]
            hover:opacity-90 active:scale-[0.98] transition-all"
        >
          <WhatsAppIcon />
          Send Order on WhatsApp
        </a>

        {/* Back to menu */}
        <Link
          href="/menu"
          className="w-full py-3.5 rounded-2xl border-2 border-primary text-primary font-bold text-sm
            flex items-center justify-center hover:bg-primary hover:text-white transition-all"
        >
          🍽️ Order More Items
        </Link>
      </div>

      <style>{`
        @keyframes popIn {
          from { transform: scale(0); opacity: 0; }
          to   { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense>
      <ConfirmationContent />
    </Suspense>
  );
}

/* ── Helpers ── */
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <p className="text-sm font-bold text-primary mb-4">{title}</p>
      {children}
    </div>
  );
}

function MetaRow({ label, value, small }: { label: string; value: React.ReactNode; small?: boolean }) {
  return (
    <div className="flex justify-between text-sm py-1.5 border-b border-gray-50 last:border-none">
      <span className="text-gray-400">{label}</span>
      <span className={`font-semibold text-right ${small ? "text-xs text-gray-400 max-w-[180px] truncate" : ""}`}>
        {value}
      </span>
    </div>
  );
}

function BillRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm text-gray-500 py-1">
      <span>{label}</span><span>{value}</span>
    </div>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
