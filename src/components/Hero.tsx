import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 md:pt-44 md:pb-32">
      {/* Background gradient */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-brand-500/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-4xl px-6 text-center">
        <div className="mb-6 inline-block rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-700 dark:border-brand-800 dark:bg-brand-900/30 dark:text-brand-400">
          Now in Public Beta
        </div>
        <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl">
          OpenClaw Infrastructure,{" "}
          <span className="text-brand-600">Zero Ops</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-600 dark:text-gray-400">
          Deploy and manage OpenClaw without the infrastructure headaches. Bring
          your own AI key for a flat rate, or let us handle everything — pay only
          for what you use.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/signup"
            className="inline-flex h-12 items-center rounded-lg bg-brand-600 px-8 text-base font-medium text-white shadow-lg shadow-brand-600/25 transition hover:bg-brand-700"
          >
            Get Started Free
          </Link>
          <a
            href="#pricing"
            className="inline-flex h-12 items-center rounded-lg border border-gray-300 px-8 text-base font-medium transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-900"
          >
            View Pricing
          </a>
        </div>

        <p className="mt-6 text-sm text-gray-500 dark:text-gray-500">
          No credit card required to start. Cancel anytime.
        </p>
      </div>
    </section>
  );
}
