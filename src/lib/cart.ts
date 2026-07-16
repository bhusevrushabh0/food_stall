import { MenuItem } from "./menu";
import { CartItem } from "./types";

export function getCartItems(
  cart: Record<number, number>,
  menu: MenuItem[]
): CartItem[] {
  return Object.entries(cart)
    .map(([id, qty]) => {
      const item = menu.find((i) => i.id === Number(id));
      return item ? { ...item, qty } : null;
    })
    .filter((i): i is CartItem => i !== null);
}

export function calcSubtotal(items: CartItem[]): number {
  return items.reduce((s, i) => s + i.price * i.qty, 0);
}

export function calcGST(subtotal: number): number {
  return Math.round(subtotal * 0.05);
}

export function calcTotal(subtotal: number, gst: number): number {
  return subtotal + gst;
}

export function totalItemCount(cart: Record<number, number>): number {
  return Object.values(cart).reduce((s, q) => s + q, 0);
}
