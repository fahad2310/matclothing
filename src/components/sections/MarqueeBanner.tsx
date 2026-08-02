import { ORIGIN, SEASON } from "@/lib/constants";

/**
 * Running band of shop facts, set in the care-label register so it reads
 * as selvedge tape rather than a promo bar.
 *
 * "New arrivals every week" was dropped — it is a frequency promise the
 * catalogue does not currently keep.
 */
export function MarqueeBanner() {
  const items = [
    "Free shipping over ₹2,000",
    "Order over WhatsApp",
    "Size confirmed before dispatch",
    ORIGIN,
    `${SEASON} collection`,
  ];

  // Two passes so the -50% keyframe loops seamlessly.
  const track = [...items, ...items, ...items, ...items];

  return (
    <div
      className="overflow-hidden border-b border-border bg-label py-3"
      aria-hidden
    >
      <div
        className="flex w-max whitespace-nowrap motion-reduce:animate-none"
        style={{ animation: "marquee 42s linear infinite" }}
      >
        {track.map((text, i) => (
          <span key={i} className="spec-label flex items-center">
            <span className="px-6">{text}</span>
            <span className="text-accent-soft">/</span>
          </span>
        ))}
      </div>
    </div>
  );
}
