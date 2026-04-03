"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { MagneticButton } from "@/components/animations/MagneticButton";
import { SOCIAL_LINKS } from "@/lib/constants";

export default function ContactPage() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const errs: Record<string, string> = {};
    if (!formState.name.trim()) errs.name = "Name is required";
    if (!formState.email.trim()) errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formState.email))
      errs.email = "Invalid email";
    if (!formState.message.trim()) errs.message = "Message is required";
    return errs;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setSubmitted(true);
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    setFormState((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[e.target.name];
        return next;
      });
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mx-auto max-w-7xl px-6 py-12"
    >
      <div className="mb-12">
        <h1 className="text-4xl font-bold tracking-wider text-foreground">
          Contact Us
        </h1>
        <p className="mt-2 text-muted">
          We&apos;d love to hear from you
        </p>
      </div>

      <div className="grid gap-12 lg:grid-cols-2">
        {/* Form */}
        <div>
          {submitted ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="text-4xl mb-4 text-accent">✓</div>
              <h2 className="text-2xl font-bold tracking-wider text-foreground">
                Message Sent
              </h2>
              <p className="mt-2 text-muted">
                We&apos;ll get back to you as soon as possible.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setFormState({ name: "", email: "", phone: "", message: "" });
                }}
                className="mt-6 text-xs text-accent hover:underline"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-xs uppercase tracking-wider text-muted mb-2"
                >
                  Name *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formState.name}
                  onChange={handleChange}
                  className="w-full border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted/50 focus:border-accent"
                  placeholder="Your name"
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-500">{errors.name}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-xs uppercase tracking-wider text-muted mb-2"
                >
                  Email *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formState.email}
                  onChange={handleChange}
                  className="w-full border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted/50 focus:border-accent"
                  placeholder="your@email.com"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-xs uppercase tracking-wider text-muted mb-2"
                >
                  Phone
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formState.phone}
                  onChange={handleChange}
                  className="w-full border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted/50 focus:border-accent"
                  placeholder="+92 300 1234567"
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-xs uppercase tracking-wider text-muted mb-2"
                >
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  value={formState.message}
                  onChange={handleChange}
                  className="w-full border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted/50 focus:border-accent resize-none"
                  placeholder="How can we help?"
                />
                {errors.message && (
                  <p className="mt-1 text-xs text-red-500">{errors.message}</p>
                )}
              </div>

              <MagneticButton className="w-full">
                <Button type="submit" size="lg" className="w-full">
                  Send Message
                </Button>
              </MagneticButton>
            </form>
          )}
        </div>

        {/* Contact Info */}
        <div className="space-y-8">
          <div className="bg-surface p-8 space-y-6">
            <h2 className="text-lg font-bold tracking-wider text-foreground">
              Get in Touch
            </h2>

            <div className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted mb-1">
                  Email
                </p>
                <a
                  href="mailto:contact@matclothing.com"
                  className="text-sm text-foreground hover:text-accent transition-colors"
                >
                  contact@matclothing.com
                </a>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-muted mb-1">
                  WhatsApp
                </p>
                <a
                  href="https://wa.me/918291681655"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-foreground hover:text-accent transition-colors"
                >
                  +91 82916 81655
                </a>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-muted mb-1">
                  Location
                </p>
                <p className="text-sm text-foreground">Mumbai, Maharashtra, India</p>
              </div>
            </div>
          </div>

          <div className="bg-surface p-8">
            <h2 className="text-lg font-bold tracking-wider text-foreground mb-4">
              Follow Us
            </h2>
            <div className="flex gap-4">
              {Object.entries(SOCIAL_LINKS).map(([name, href]) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-border px-4 py-2 text-xs uppercase tracking-wider text-foreground transition-all hover:border-accent hover:text-accent"
                >
                  {name}
                </a>
              ))}
            </div>
          </div>

          <div className="bg-surface p-8">
            <h2 className="text-lg font-bold tracking-wider text-foreground mb-4">
              Business Hours
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Monday - Friday</span>
                <span className="text-foreground">10:00 AM - 8:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Saturday</span>
                <span className="text-foreground">11:00 AM - 6:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Sunday</span>
                <span className="text-foreground">Closed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
