import { WORDMARK, FOUNDED_YEAR, SITE_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

/**
 * The wordmark, set live rather than shipped as an image.
 *
 * The brand logo collides two type registers inside one word: "brand" in an
 * italic high-contrast serif, "industrys" in a heavy lowercase grotesk. That
 * clash is the identity, so the whole site's type system is derived from it —
 * the serif carries voice, the heavy sans carries authority, and the care
 * label supplies the third, quiet register.
 *
 * Live type stays crisp at 13vw, animates, and needs no image request.
 */

interface WordmarkProps {
  className?: string;
  /** Show the "SINCE 2023" line beneath, as on the logo lockup. */
  showEstablished?: boolean;
  /** Renders as an <h1>. Use once per page; defaults to a plain span. */
  as?: "h1" | "span" | "div";
}

export function Wordmark({
  className,
  showEstablished = false,
  as: Tag = "span",
}: WordmarkProps) {
  return (
    <Tag className={cn("inline-block leading-[0.85]", className)}>
      {/* One accessible name — the two halves are decorative fragments */}
      <span className="sr-only">{SITE_NAME}</span>

      <span aria-hidden className="block whitespace-nowrap">
        {/*
         * The serif "d" leans hard right. Without trailing room its terminal
         * crashes into the "i" of the grotesk half — the logo sets them
         * close, but not overlapping.
         */}
        <span className="font-display italic tracking-[-0.01em] pr-[0.11em]">
          {WORDMARK.serif}
        </span>
        <span className="font-sans font-extrabold tracking-[-0.045em]">
          {WORDMARK.sans}
        </span>
      </span>

      {showEstablished && (
        <span
          aria-hidden
          className="mt-2 block text-center font-sans text-[0.16em] font-bold uppercase tracking-[0.28em]"
          style={{ fontSize: "0.115em" }}
        >
          Since {FOUNDED_YEAR}
        </span>
      )}
    </Tag>
  );
}
