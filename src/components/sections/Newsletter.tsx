"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { TextReveal } from "@/components/animations/TextReveal";
import { MagneticButton } from "@/components/animations/MagneticButton";

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
    <section className="bg-surface py-20">
      <div className="mx-auto max-w-xl px-6 text-center">
        <ScrollReveal>
          <p className="text-xs tracking-[0.3em] uppercase text-accent mb-2">
            Stay Updated
          </p>
        </ScrollReveal>

        <TextReveal className="text-3xl font-bold tracking-wider text-foreground">
          Join the MAT Family
        </TextReveal>

        <ScrollReveal delay={0.2}>
          <p className="mt-4 text-sm text-muted">
            Be the first to know about new arrivals, exclusive offers, and
            collection drops.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.3}>
          {submitted ? (
            <p className="mt-8 text-accent">Thank you for subscribing!</p>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="mt-8 flex flex-col gap-3 sm:flex-row"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="flex-1 border border-border bg-background px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted/50 focus:border-accent"
              />
              <MagneticButton>
                <Button type="submit">Subscribe</Button>
              </MagneticButton>
            </form>
          )}
        </ScrollReveal>
      </div>
    </section>
  );
}
