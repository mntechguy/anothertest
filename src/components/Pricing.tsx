import Link from "next/link";

const tiers = [
  {
    name: "Bring Your Own Key",
    id: "byok",
    price: "$29",
    period: "/month",
    description:
      "Use your existing AI API keys. We handle the infrastructure — you control the AI provider.",
    features: [
      "Hosted OpenClaw infrastructure",
      "Plug in any AI API key (OpenAI, Anthropic, etc.)",
      "Usage dashboard & logging",
      "Community support",
      "99.9% uptime SLA",
      "No markup on AI usage",
    ],
    cta: "Start with BYOK",
    highlight: false,
  },
  {
    name: "Managed AI",
    id: "managed",
    price: "$49",
    period: "/month + usage",
    description:
      "We provide the AI — no keys needed. Pay a base fee plus only for what you use.",
    features: [
      "Everything in BYOK",
      "Managed AI keys — no setup required",
      "Auto-scaling & load balancing",
      "Starting at $0.50 per 1K requests",
      "Real-time usage & cost dashboard",
      "Priority support with dedicated Slack",
    ],
    cta: "Start with Managed AI",
    highlight: true,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 md:py-28">
      <div className="mx-auto max-w-5xl px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-gray-600 dark:text-gray-400">
            Start free, scale as you grow. No hidden fees.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`relative rounded-2xl border p-8 ${
                tier.highlight
                  ? "border-brand-500 shadow-xl shadow-brand-500/10"
                  : "border-gray-200 dark:border-gray-800"
              }`}
            >
              {tier.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-600 px-4 py-1 text-xs font-semibold text-white">
                  Most Popular
                </div>
              )}

              <h3 className="text-xl font-bold">{tier.name}</h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {tier.description}
              </p>

              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-bold">{tier.price}</span>
                <span className="text-gray-500">{tier.period}</span>
              </div>

              <Link
                href={`/signup?plan=${tier.id}`}
                className={`mt-8 block w-full rounded-lg py-3 text-center text-sm font-semibold transition ${
                  tier.highlight
                    ? "bg-brand-600 text-white shadow-lg shadow-brand-600/25 hover:bg-brand-700"
                    : "bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                }`}
              >
                {tier.cta}
              </Link>

              <ul className="mt-8 space-y-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <svg
                      className="mt-0.5 h-4 w-4 shrink-0 text-brand-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2.5}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 12.75l6 6 9-13.5"
                      />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
