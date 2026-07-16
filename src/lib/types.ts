import { MenuItem } from "./menu";

export interface CartItem extends MenuItem {
  qty: number;
}

export type OrderStatus = "paid" | "preparing" | "ready" | "done" | "rejected";

export interface Order {
  orderId: string;
  name: string;
  whatsapp: string;
  note: string;
  items: CartItem[];
  subtotal: number;
  gst: number;
  total: number;
  status: OrderStatus;
  paymentId: string;
  timestamp: string;
}
