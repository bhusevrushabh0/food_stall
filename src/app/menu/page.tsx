"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MENU, CATEGORIES, Category, MenuItem } from "@/lib/menu";
import { useCart } from "@/context/CartContext";
import { totalItemCount } from "@/lib/cart";
import VegDot from "@/components/VegDot";
import QtyControl from "@/components/QtyControl";

export default function MenuPage() {
  const { cart, addItem, removeItem } = useCart();
  const [activeCategory, setActiveCategory] = useState<Category | "All">("All");
  const router = useRouter();

  const visibleCategories =
    activeCategory === "All" ? CATEGORIES : [activeCategory];

  const itemCount = totalItemCount(cart);
  const cartTotal = Object.entries(cart).reduce((sum, [id, qty]) => {
    const item = MENU.find((i) => i.id === Number(id));
    return sum + (item?.price || 0) * qty;
  }, 0);

  return (
    <div className="min-h-screen bg-stall-bg pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-primary to-orange-400 text-white px-4 py-4 text-center shadow-md">
        <h1 className="text-xl font-bold">🍽️ Shree Food Stall</h1>
        <p className="text-xs opacity-90 mt-0.5">Fresh • Hot • Delicious</p>
      </header>

      {/* Category tabs */}
      <div className="sticky top-[68px] z-40 bg-white border-b border-gray-100 px-4 py-3 flex gap-2 overflow-x-auto scrollbar-hide shadow-sm">
        {(["All", ...CATEGORIES] as (Category | "All")[]).map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold border-[1.5px] transition-all
              ${activeCategory === cat
                ? "bg-primary text-white border-primary"
                : "bg-white text-primary border-primary hover:bg-primary hover:text-white"
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Menu items */}
      <div className="px-4 pt-4">
        {visibleCategories.map((cat) => (
          <div key={cat}>
            <h2 className="text-sm font-bold text-primary border-l-4 border-primary pl-3 mb-3 mt-4">
              {cat}
            </h2>
            <div className="flex flex-col gap-3">
              {MENU.filter((i) => i.category === cat).map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  qty={cart[item.id] || 0}
                  onAdd={() => addItem(item.id)}
                  onRemove={() => removeItem(item.id)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Cart bar */}
      {itemCount > 0 && (
        <div
          className="fixed bottom-0 left-0 right-0 bg-primary text-white px-5 py-4 flex items-center justify-between cursor-pointer rounded-t-2xl shadow-[0_-4px_20px_rgba(255,107,53,0.4)] z-50"
          onClick={() => router.push("/checkout")}
        >
          <div>
            <p className="text-xs opacity-85">
              {itemCount} item{itemCount > 1 ? "s" : ""}
            </p>
            <p className="font-bold text-base">View Cart</p>
          </div>
          <div className="flex items-center gap-2 font-bold text-lg">
            ₹{cartTotal}
            <span className="text-xl">›</span>
          </div>
        </div>
      )}
    </div>
  );
}

function ItemCard({
  item,
  qty,
  onAdd,
  onRemove,
}: {
  item: MenuItem;
  qty: number;
  onAdd: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm active:scale-[0.98] transition-transform">
      {/* Emoji */}
      <div className="w-14 h-14 rounded-xl bg-orange-50 flex items-center justify-center text-3xl flex-shrink-0">
        {item.emoji}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm flex items-center">
          <VegDot veg={item.veg} />
          {item.name}
        </p>
        <p className="text-xs text-gray-400 mt-0.5 truncate">{item.desc}</p>
        <p className="text-sm font-bold text-primary mt-1">₹{item.price}</p>
      </div>

      {/* Add / Qty */}
      <div className="flex-shrink-0">
        {qty === 0 ? (
          <button
            onClick={onAdd}
            className="bg-primary text-white font-bold text-sm px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
          >
            ADD
          </button>
        ) : (
          <QtyControl qty={qty} onAdd={onAdd} onRemove={onRemove} />
        )}
      </div>
    </div>
  );
}
