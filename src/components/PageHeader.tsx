"use client";
import { useRouter } from "next/navigation";

interface Props {
  title: string;
  showBack?: boolean;
}

export default function PageHeader({ title, showBack = true }: Props) {
  const router = useRouter();
  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-primary to-orange-400 text-white px-4 py-3 flex items-center gap-3 shadow-md">
      {showBack && (
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-full bg-white/25 flex items-center justify-center text-lg font-bold hover:bg-white/40 transition"
        >
          ←
        </button>
      )}
      <h1 className="text-xl font-bold tracking-tight">{title}</h1>
    </header>
  );
}
