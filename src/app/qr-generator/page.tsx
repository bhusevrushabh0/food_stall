"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";

export default function QRGeneratorPage() {
  const [url, setUrl]         = useState("");
  const [stallName, setStallName] = useState("Shree Food Stall");
  const [size, setSize]       = useState(220);
  const [generated, setGenerated] = useState(false);
  const [QRCode, setQRCode]   = useState<React.ComponentType<QRProps> | null>(null);

  // Pre-fill with current origin
  useEffect(() => {
    setUrl(window.location.origin + "/menu");
  }, []);

  // Dynamically import qrcode.react (client-only)
  useEffect(() => {
    import("qrcode.react").then((mod) => {
      setQRCode(() => mod.QRCodeCanvas as React.ComponentType<QRProps>);
    });
  }, []);

  function generate() {
    if (!url.trim()) return;
    setGenerated(true);
    // Scroll to output
    setTimeout(() => {
      document.getElementById("qr-output")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }

  function downloadQR() {
    const canvas = document.querySelector<HTMLCanvasElement>("#qr-canvas-wrap canvas");
    if (!canvas) return;
    const link  = document.createElement("a");
    link.href   = canvas.toDataURL("image/png");
    link.download = "food-stall-qr.png";
    link.click();
  }

  const steps = [
    { n: "1", t: "Enter your menu URL", d: "Deploy free on GitHub Pages, Vercel, or Netlify and paste the URL." },
    { n: "2", t: "Print the QR poster",  d: "Download and print. Display on your stall table, wall, or standee." },
    { n: "3", t: "Customers scan & pay", d: "They open the menu, add items, enter WhatsApp number, pay via Razorpay." },
    { n: "4", t: "Dashboard + WhatsApp", d: "You get notified instantly on dashboard. Customer gets bill on WhatsApp." },
  ];

  return (
    <div className="min-h-screen bg-stall-bg pb-10">
      <PageHeader title="📱 QR Code Generator" />

      <div className="max-w-lg mx-auto px-4 pt-5 flex flex-col gap-4">

        {/* Config */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-sm font-bold text-primary mb-4">⚙️ Configure</p>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">
              Menu Page URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://your-site.com/menu"
              className="w-full px-4 py-3 rounded-xl border-[1.5px] border-gray-200 text-sm bg-gray-50
                outline-none focus:border-primary focus:bg-white transition"
            />
            <p className="text-xs text-gray-400 mt-1">
              Customers will land here after scanning the QR.
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">
              Stall Name (on poster)
            </label>
            <input
              type="text"
              value={stallName}
              onChange={(e) => setStallName(e.target.value)}
              placeholder="Shree Food Stall"
              className="w-full px-4 py-3 rounded-xl border-[1.5px] border-gray-200 text-sm bg-gray-50
                outline-none focus:border-primary focus:bg-white transition"
            />
          </div>

          <div className="mb-5">
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">
              QR Size: {size}px
            </label>
            <input
              type="range"
              min={150}
              max={320}
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>

          <button
            onClick={generate}
            disabled={!url.trim()}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary to-orange-400 text-white font-bold text-base
              shadow-[0_4px_14px_rgba(255,107,53,0.35)] hover:opacity-90 active:scale-[0.98] transition
              disabled:opacity-40 disabled:cursor-not-allowed"
          >
            🎯 Generate QR Code
          </button>
        </div>

        {/* QR Output */}
        {generated && QRCode && (
          <div id="qr-output" className="bg-white rounded-2xl p-5 shadow-sm flex flex-col items-center gap-4">
            <p className="text-sm font-bold text-primary self-start">🖨️ Your QR Poster</p>

            {/* Poster */}
            <div className="border-[3px] border-primary rounded-2xl p-6 text-center shadow-md w-full max-w-xs">
              <h2 className="text-xl font-extrabold text-primary">{stallName}</h2>
              <p className="text-xs text-gray-400 mt-1 mb-4">Scan to View Menu &amp; Order 🍽️</p>

              <div id="qr-canvas-wrap" className="flex justify-center">
                <QRCode
                  value={url}
                  size={size}
                  level="H"
                  includeMargin
                  style={{ borderRadius: 10 }}
                />
              </div>

              <div className="flex items-center gap-2 mt-4">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 font-bold">📲 Scan Me</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <p className="text-[10px] text-gray-400 mt-2 break-all">{url}</p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 w-full max-w-xs">
              <button
                onClick={downloadQR}
                className="flex-1 py-3 rounded-xl bg-gray-900 text-white text-sm font-bold
                  flex items-center justify-center gap-2 hover:opacity-85 transition"
              >
                ⬇️ Download
              </button>
              <Link
                href="/dashboard"
                className="flex-1 py-3 rounded-xl bg-primary text-white text-sm font-bold
                  flex items-center justify-center gap-2 hover:opacity-85 transition"
              >
                📊 Dashboard
              </Link>
            </div>
          </div>
        )}

        {/* How it works */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-sm font-bold text-primary mb-4">📖 How It Works</p>
          <div className="flex flex-col gap-3">
            {steps.map((s) => (
              <div key={s.n} className="flex gap-3 items-start text-sm">
                <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex-shrink-0 flex items-center justify-center mt-0.5">
                  {s.n}
                </span>
                <div>
                  <span className="font-semibold">{s.t}</span>
                  <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{s.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

interface QRProps {
  value: string;
  size?: number;
  level?: string;
  includeMargin?: boolean;
  style?: React.CSSProperties;
}
