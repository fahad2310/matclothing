"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { TextReveal } from "@/components/animations/TextReveal";
import { SpecEyebrow } from "@/components/ui/SpecLabel";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
    setEmail("");
  }

  return (
    <section className="border-b border-border bg-surface">
      <div className="mx-auto max-w-[1400px] px-6 py-24 lg:px-12">
        <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <ScrollReveal>
              <SpecEyebrow>Mailing list</SpecEyebrow>
            </ScrollReveal>

            <TextReveal className="font-display mt-6 max-w-xl text-[clamp(1.875rem,3.5vw,3rem)] leading-[1.1] text-foreground">
              Hear about a drop before it sells out.
            </TextReveal>

            <ScrollReveal delay={0.15}>
              <p className="mt-5 max-w-md text-[15px] leading-relaxed text-muted">
                One note per drop. No weekly mail, no discount spam — we send
                when there is something new to see.
              </p>
            </ScrollReveal>
          </div>

          <ScrollReveal delay={0.25} className="lg:w-[26rem]">
            {submitted ? (
              <p
                role="status"
                className="border-l-2 border-accent-soft bg-label px-5 py-4 text-[15px] text-foreground"
              >
                You&apos;re on the list. We&apos;ll be in touch at the next drop.
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
                <label htmlFor="newsletter-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="flex-1 border border-border bg-background px-4 py-3.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted/70 focus:border-foreground"
                />
                <Button type="submit">Join</Button>
              </form>
            )}
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
