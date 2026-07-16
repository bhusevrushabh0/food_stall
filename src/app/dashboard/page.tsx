"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  getOrders,
  updateOrderStatus,
  clearDoneOrders,
  buildReadyWAMessage,
  buildWAMessage,
  playBell,
} from "@/lib/orders";
import { Order, OrderStatus } from "@/lib/types";

type Filter = "all" | OrderStatus;

const STATUS_META: Record<
  OrderStatus,
  { label: string; cls: string }
> = {
  paid:      { label: "🟡 New Order",  cls: "bg-yellow-900/30 text-yellow-300" },
  preparing: { label: "🔥 Preparing",  cls: "bg-orange-900/30 text-orange-300" },
  ready:     { label: "✅ Ready",       cls: "bg-blue-900/30  text-blue-300"   },
  done:      { label: "📦 Done",        cls: "bg-gray-700     text-gray-400"   },
  rejected:  { label: "❌ Rejected",    cls: "bg-red-900/30   text-red-400"    },
};

export default function DashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [toast, setToast]   = useState("");
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set());

  const refresh = useCallback(() => {
    setOrders(getOrders());
  }, []);

  // Show toast
  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  }

  // Status update
  function changeStatus(orderId: string, status: OrderStatus) {
    updateOrderStatus(orderId, status);
    refresh();
  }

  // Clear done
  function handleClearDone() {
    clearDoneOrders();
    refresh();
  }

  // BroadcastChannel + polling
  useEffect(() => {
    refresh();
    setSeenIds(new Set(getOrders().map((o) => o.orderId)));

    // BroadcastChannel for same-browser real-time
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel("fs_orders_channel");
      bc.onmessage = (e) => {
        if (e.data?.type === "NEW_ORDER") {
          playBell();
          showToast(`🔔 New order from ${e.data.order.name}!`);
          refresh();
        }
      };
    } catch {}

    // Fallback polling every 3 s
    const poll = setInterval(() => {
      const all = getOrders();
      const newOnes = all.filter((o) => !seenIds.has(o.orderId));
      if (newOnes.length > 0) {
        newOnes.forEach((o) => {
          setSeenIds((prev) => new Set([...prev, o.orderId]));
          playBell();
          showToast(`🔔 New order from ${o.name}!`);
        });
        refresh();
      }
    }, 3000);

    return () => {
      bc?.close();
      clearInterval(poll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const displayed =
    filter === "all" ? orders : orders.filter((o) => o.status === filter);

  const today = new Date().toDateString();
  const todayOrders = orders.filter(
    (o) => new Date(o.timestamp).toDateString() === today
  );
  const revenue = todayOrders
    .filter((o) => o.status !== "rejected")
    .reduce((s, o) => s + o.total, 0);

  return (
    <div className="min-h-screen bg-stall-dark text-gray-100">
      {/* Top bar */}
      <div className="sticky top-0 z-50 bg-stall-card border-b border-stall-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
          <h1 className="text-lg font-bold text-primary">🍽️ Stall Dashboard</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleClearDone}
            className="text-xs text-gray-400 border border-gray-600 px-3 py-1.5 rounded-lg hover:border-red-500 hover:text-red-400 transition"
          >
            Clear Done
          </button>
          <Link
            href="/qr-generator"
            className="text-xs bg-primary text-white px-3 py-1.5 rounded-lg font-semibold"
          >
            📱 QR Code
          </Link>
          <Link
            href="/"
            className="text-xs text-gray-400 border border-gray-600 px-3 py-1.5 rounded-lg hover:text-white transition"
          >
            Home
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 max-w-5xl mx-auto">
        {[
          { label: "Today's Orders",  value: todayOrders.length },
          { label: "New / Pending",   value: orders.filter((o) => o.status === "paid").length },
          { label: "Preparing",       value: orders.filter((o) => o.status === "preparing").length },
          { label: "Revenue Today",   value: `₹${revenue}` },
        ].map((s) => (
          <div key={s.label} className="bg-stall-card rounded-xl p-4 text-center border border-stall-border">
            <p className="text-2xl font-extrabold text-primary">{s.value}</p>
            <p className="text-xs text-gray-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 px-4 pb-3 max-w-5xl mx-auto overflow-x-auto scrollbar-hide">
        {(["all", "paid", "preparing", "ready", "done"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold border transition
              ${filter === f
                ? "border-primary text-primary bg-primary/10"
                : "border-stall-border text-gray-400 bg-stall-card hover:border-primary/50"
              }`}
          >
            {f === "all" ? "All Orders" :
             f === "paid" ? "🟡 New" :
             f === "preparing" ? "🔥 Preparing" :
             f === "ready" ? "✅ Ready" : "📦 Done"}
          </button>
        ))}
      </div>

      {/* Orders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 px-4 pb-10 max-w-5xl mx-auto">
        {displayed.length === 0 ? (
          <div className="col-span-full text-center py-20 text-gray-500">
            <p className="text-5xl mb-4">📭</p>
            <p>No orders here yet. Waiting…</p>
          </div>
        ) : (
          displayed.map((order) => (
            <OrderCard
              key={order.orderId}
              order={order}
              onChangeStatus={changeStatus}
            />
          ))
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed top-16 right-4 bg-primary text-white px-4 py-3 rounded-xl text-sm font-semibold shadow-lg z-50 animate-bounce">
          {toast}
        </div>
      )}
    </div>
  );
}

/* ── Order Card ─────────────────────────────────────────── */
function OrderCard({
  order,
  onChangeStatus,
}: {
  order: Order;
  onChangeStatus: (id: string, s: OrderStatus) => void;
}) {
  const st = STATUS_META[order.status] ?? STATUS_META.paid;

  const time = new Date(order.timestamp).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  function waNotify() {
    const msg =
      order.status === "ready" || order.status === "done"
        ? buildReadyWAMessage(order)
        : buildWAMessage(order);
    window.open(`https://wa.me/91${order.whatsapp}?text=${msg}`, "_blank");
  }

  return (
    <div
      className={`bg-stall-card rounded-2xl p-4 border flex flex-col gap-3
        ${order.status === "paid" ? "border-primary/60 shadow-[0_0_14px_rgba(255,107,53,0.2)]" : "border-stall-border"}`}
    >
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-bold text-primary">{order.orderId}</p>
          <p className="text-xs text-gray-500 mt-0.5">🕐 {time}</p>
          <p className="font-bold mt-1">👤 {order.name}</p>
          <p className="text-xs text-green-400">📱 +91 {order.whatsapp}</p>
        </div>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${st.cls}`}>
          {st.label}
        </span>
      </div>

      {/* Items */}
      <div className="border-t border-stall-border pt-2 flex flex-col gap-1">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between text-xs text-gray-300">
            <span>{item.emoji} {item.name} × {item.qty}</span>
            <span className="text-primary font-semibold">₹{item.price * item.qty}</span>
          </div>
        ))}
      </div>

      {/* Note */}
      {order.note && (
        <p className="text-xs text-gray-500 italic">📝 {order.note}</p>
      )}

      {/* Total */}
      <div className="flex justify-between font-bold text-sm border-t border-stall-border pt-2">
        <span>Total</span>
        <span className="text-primary">₹{order.total}</span>
      </div>

      {/* Actions */}
      <div className="flex gap-2 flex-wrap">
        {order.status === "paid" && (
          <>
            <ActionBtn color="yellow" onClick={() => onChangeStatus(order.orderId, "preparing")}>
              🔥 Start
            </ActionBtn>
            <ActionBtn color="red" onClick={() => onChangeStatus(order.orderId, "rejected")}>
              ❌
            </ActionBtn>
          </>
        )}
        {order.status === "preparing" && (
          <>
            <ActionBtn color="blue" onClick={() => onChangeStatus(order.orderId, "ready")}>
              ✅ Ready
            </ActionBtn>
            <ActionBtn color="green" onClick={waNotify}>💬 Notify</ActionBtn>
          </>
        )}
        {order.status === "ready" && (
          <>
            <ActionBtn color="green" onClick={() => onChangeStatus(order.orderId, "done")}>
              📦 Done
            </ActionBtn>
            <ActionBtn color="green" onClick={waNotify}>💬 Remind</ActionBtn>
          </>
        )}
        {order.status === "done" && (
          <ActionBtn color="green" onClick={waNotify}>💬 WhatsApp</ActionBtn>
        )}
      </div>
    </div>
  );
}

const colorMap: Record<string, string> = {
  yellow: "bg-yellow-500 text-gray-900",
  blue:   "bg-blue-500   text-white",
  green:  "bg-green-500  text-white",
  red:    "bg-red-500    text-white",
};

function ActionBtn({
  color, onClick, children,
}: {
  color: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-2 rounded-lg text-xs font-bold transition hover:opacity-85 active:scale-95 ${colorMap[color]}`}
    >
      {children}
    </button>
  );
}
