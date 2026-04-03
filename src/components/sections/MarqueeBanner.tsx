"use client";

export function MarqueeBanner() {
  const items = [
    "FREE SHIPPING ON ORDERS ABOVE ₹2,000",
    "★",
    "PREMIUM QUALITY GUARANTEED",
    "★",
    "NEW ARRIVALS EVERY WEEK",
    "★",
    "ORDER VIA WHATSAPP",
    "★",
  ];

  const repeated = [...items, ...items, ...items, ...items];

  return (
    <div className="overflow-hidden border-y border-accent/10 bg-accent/[0.03] py-3">
      <div
        className="flex whitespace-nowrap"
        style={{ animation: "marquee 30s linear infinite" }}
      >
        {repeated.map((text, i) => (
          <span
            key={i}
            className="mx-6 text-[11px] tracking-[0.3em] uppercase text-accent/60"
          >
            {text}
          </span>
        ))}
      </div>
    </div>
  );
}
