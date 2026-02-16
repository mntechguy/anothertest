"use client";

import { useState } from "react";

const faqs = [
  {
    q: "What is OpenClaw as a Service?",
    a: "OpenClaw as a Service is a fully managed platform that deploys, scales, and monitors OpenClaw for you. You get all the power of OpenClaw without managing any infrastructure — just sign up, pick a plan, and start building.",
  },
  {
    q: "What's the difference between BYOK and Managed AI?",
    a: "With Bring Your Own Key (BYOK), you provide your own AI API key (e.g., from OpenAI or Anthropic) and pay a flat $29/month for infrastructure. With Managed AI, we provide the AI keys for you — you pay a $49/month base fee plus usage-based pricing starting at $0.50 per 1K requests.",
  },
  {
    q: "How are my API keys stored?",
    a: "All API keys are encrypted at rest using AES-256 and in transit using TLS 1.3. Keys are stored in isolated, SOC 2 compliant infrastructure and are never logged or exposed in plaintext.",
  },
  {
    q: "Can I switch plans later?",
    a: "Yes, you can upgrade or downgrade between BYOK and Managed AI at any time from your dashboard. Changes take effect at the start of your next billing cycle.",
  },
  {
    q: "What happens if I exceed usage limits?",
    a: "BYOK has no usage limits from us — you're only limited by your own API key's rate limits. On Managed AI, usage is metered and billed monthly. You can set budget alerts and hard caps in the dashboard to avoid surprises.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Absolutely. There are no contracts or cancellation fees. You can cancel your subscription at any time from your dashboard, and you'll retain access through the end of your billing period.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="py-20 md:py-28">
      <div className="mx-auto max-w-3xl px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Frequently asked questions
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Everything you need to know about OpenClaw as a Service.
          </p>
        </div>

        <div className="mt-12 divide-y divide-gray-200 dark:divide-gray-800">
          {faqs.map((faq, i) => (
            <div key={i} className="py-5">
              <button
                className="flex w-full items-center justify-between text-left"
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
              >
                <span className="text-base font-medium">{faq.q}</span>
                <svg
                  className={`ml-4 h-5 w-5 shrink-0 text-gray-500 transition-transform ${
                    open === i ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                  />
                </svg>
              </button>
              {open === i && (
                <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
