import Link from "next/link";

const tiles = [
  {
    href: "/menu",
    icon: "📱",
    title: "Customer Menu",
    desc: "Browse items, add to cart & pay online.\nCustomers land here via QR scan.",
    primary: true,
  },
  {
    href: "/dashboard",
    icon: "📊",
    title: "Stall Dashboard",
    desc: "Real-time incoming orders. Update status and notify customers on WhatsApp.",
    primary: false,
  },
  {
    href: "/qr-generator",
    icon: "📷",
    title: "QR Generator",
    desc: "Generate and print the QR code to display at your stall.",
    primary: false,
  },
];

const steps = [
  { num: "1️⃣", title: "Customer scans QR", desc: "Opens menu on their phone browser — no app download needed." },
  { num: "2️⃣", title: "Select & Pay",       desc: "Adds items to cart, enters WhatsApp number, pays via Razorpay." },
  { num: "3️⃣", title: "Dashboard alert",    desc: "Order appears on your dashboard with a bell sound instantly." },
  { num: "4️⃣", title: "WhatsApp bill",      desc: "Customer gets full bill & order summary on WhatsApp. Zero cost." },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-stall-bg flex flex-col items-center justify-center px-4 py-10">
      {/* Hero */}
      <div className="text-7xl mb-3">🍽️</div>
      <h1 className="text-3xl font-extrabold text-primary">Shree Food Stall</h1>
      <p className="text-gray-400 mt-2 mb-10 text-center text-sm leading-relaxed">
        Complete Digital Ordering System<br />
        100% Free &amp; Open Source
      </p>

      {/* Main tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl">
        {tiles.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className={`rounded-2xl p-7 flex flex-col items-center gap-3 text-center border-2 border-transparent
              transition-all duration-200 hover:-translate-y-1 hover:border-primary hover:shadow-lg
              ${t.primary
                ? "bg-gradient-to-br from-primary to-orange-400 text-white shadow-md"
                : "bg-white text-gray-900 shadow-sm"
              }`}
          >
            <span className="text-4xl">{t.icon}</span>
            <span className="font-bold text-base">{t.title}</span>
            <span className={`text-xs leading-relaxed whitespace-pre-line ${t.primary ? "text-orange-100" : "text-gray-400"}`}>
              {t.desc}
            </span>
          </Link>
        ))}
      </div>

      {/* Divider */}
      <div className="w-full max-w-2xl flex items-center gap-3 my-8">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400 font-semibold tracking-widest">HOW IT WORKS</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* Steps */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-2xl">
        {steps.map((s) => (
          <div key={s.num} className="bg-white rounded-xl p-4 flex flex-col items-center gap-2 text-center shadow-sm">
            <span className="text-2xl">{s.num}</span>
            <span className="font-bold text-xs">{s.title}</span>
            <span className="text-xs text-gray-400 leading-relaxed">{s.desc}</span>
          </div>
        ))}
      </div>

      {/* Tech note */}
      <p className="mt-8 text-xs text-gray-400 text-center max-w-md leading-relaxed">
        <strong className="text-gray-500">Tech used (all free):</strong> Next.js 14 · Tailwind CSS ·
        qrcode.react · Razorpay test mode · WhatsApp wa.me · BroadcastChannel API · localStorage
      </p>
    </main>
  );
}
