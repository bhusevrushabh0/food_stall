import { Order, OrderStatus } from "./types";

const STORAGE_KEY = "fs_orders";
const CHANNEL_NAME = "fs_orders_channel";

export function getOrders(): Order[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveOrder(order: Order): void {
  if (typeof window === "undefined") return;
  const all = getOrders();
  const existing = all.findIndex((o) => o.orderId === order.orderId);
  if (existing >= 0) {
    all[existing] = order;
  } else {
    all.unshift(order);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));

  // Broadcast to dashboard
  try {
    const bc = new BroadcastChannel(CHANNEL_NAME);
    bc.postMessage({ type: "NEW_ORDER", order });
    bc.close();
  } catch {}
}

export function updateOrderStatus(orderId: string, status: OrderStatus): void {
  if (typeof window === "undefined") return;
  const all = getOrders();
  const idx = all.findIndex((o) => o.orderId === orderId);
  if (idx >= 0) {
    all[idx].status = status;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  }
}

export function clearDoneOrders(): void {
  if (typeof window === "undefined") return;
  const filtered = getOrders().filter((o) => o.status !== "done");
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export function getOrderById(orderId: string): Order | undefined {
  return getOrders().find((o) => o.orderId === orderId);
}

export function buildWAMessage(order: Order): string {
  const itemLines = order.items
    .map((i) => `  • ${i.name} × ${i.qty} = ₹${i.price * i.qty}`)
    .join("\n");

  return encodeURIComponent(
    `🍽️ *Shree Food Stall — Order Confirmed!*\n\n` +
    `📋 *Order ID:* ${order.orderId}\n` +
    `👤 *Name:* ${order.name}\n` +
    `🕐 *Time:* ${new Date(order.timestamp).toLocaleString("en-IN")}\n\n` +
    `*🛒 Items Ordered:*\n${itemLines}\n\n` +
    `💰 *Subtotal:* ₹${order.subtotal}\n` +
    `🏷️ *GST (5%):* ₹${order.gst}\n` +
    `✅ *Total Paid:* ₹${order.total}\n\n` +
    `🔐 *Payment ID:* ${order.paymentId || "N/A"}\n` +
    (order.note ? `📝 *Note:* ${order.note}\n\n` : "\n") +
    `Thank you for your order! Your food will be ready shortly. 🙏`
  );
}

export function buildReadyWAMessage(order: Order): string {
  const itemLines = order.items
    .map((i) => `  • ${i.name} × ${i.qty}`)
    .join("\n");

  return encodeURIComponent(
    `🍽️ *Shree Food Stall*\n\n` +
    `Hi ${order.name}! Your order is *Ready for Pickup* 🎉\n\n` +
    `📋 Order ID: ${order.orderId}\n` +
    `*Items:*\n${itemLines}\n\n` +
    `✅ *Total: ₹${order.total}* (Paid)\n\n` +
    `Please collect your order from the counter. Thank you! 🙏`
  );
}

export function playBell(): void {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.6, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.6);
  } catch {}
}
