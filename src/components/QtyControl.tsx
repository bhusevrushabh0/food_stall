"use client";

interface Props {
  qty: number;
  onAdd: () => void;
  onRemove: () => void;
  size?: "sm" | "md";
}

export default function QtyControl({ qty, onAdd, onRemove, size = "md" }: Props) {
  const btnBase =
    size === "sm"
      ? "w-7 h-7 text-base rounded-lg"
      : "w-8 h-8 text-lg rounded-lg";
  const numW = size === "sm" ? "w-7 text-sm" : "w-8 text-base";

  return (
    <div className="flex items-center">
      <button
        onClick={onRemove}
        className={`${btnBase} bg-orange-100 text-primary font-bold flex items-center justify-center hover:bg-orange-200 transition-colors`}
      >
        −
      </button>
      <span className={`${numW} text-center font-bold text-gray-900`}>{qty}</span>
      <button
        onClick={onAdd}
        className={`${btnBase} bg-primary text-white font-bold flex items-center justify-center hover:bg-primary-dark transition-colors`}
      >
        +
      </button>
    </div>
  );
}
