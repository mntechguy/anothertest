# OpenClaw as a Service

A SaaS landing page and checkout flow for OpenClaw — deploy and manage OpenClaw infrastructure with zero ops.

## Plans

- **Bring Your Own Key (BYOK)** — $29/mo flat. Plug in your own AI API key; we handle the infrastructure.
- **Managed AI** — $49/mo base + usage-based pricing. We provide the AI — no keys needed.

## Tech Stack

- **Next.js 15** (App Router, TypeScript)
- **Tailwind CSS v4**
- **Stripe** (Checkout Sessions, Subscriptions, Metered Billing, Webhooks)

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Stripe keys and price IDs. See `.env.example` for details.

### 3. Set up Stripe

1. Create a [Stripe account](https://dashboard.stripe.com/register)
2. Create two products in the Stripe Dashboard:
   - **BYOK** — with a recurring price of $29/month
   - **Managed AI** — with a recurring base price of $49/month AND a metered usage price
3. Copy the Price IDs into your `.env.local`
4. Create a webhook endpoint pointing to `https://yourdomain.com/api/webhook`
5. Copy the webhook signing secret into `.env.local`

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Test with Stripe CLI (optional)

```bash
stripe listen --forward-to localhost:3000/api/webhook
```

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── layout.tsx            # Root layout
│   ├── globals.css           # Global styles + Tailwind theme
│   ├── signup/
│   │   └── page.tsx          # Sign-up + plan selection form
│   ├── success/
│   │   └── page.tsx          # Post-checkout success page
│   └── api/
│       ├── checkout/
│       │   └── route.ts      # Creates Stripe Checkout sessions
│       └── webhook/
│           └── route.ts      # Handles Stripe webhook events
└── components/
    ├── Navbar.tsx
    ├── Hero.tsx
    ├── Features.tsx
    ├── Pricing.tsx
    ├── FAQ.tsx
    └── Footer.tsx
```

## Environment Variables

| Variable | Description |
|---|---|
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (pk_test_...) |
| `STRIPE_SECRET_KEY` | Stripe secret key (sk_test_...) |
| `STRIPE_BYOK_PRICE_ID` | Price ID for BYOK plan |
| `STRIPE_MANAGED_BASE_PRICE_ID` | Price ID for Managed AI base subscription |
| `STRIPE_MANAGED_METERED_PRICE_ID` | Price ID for Managed AI metered usage |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `APP_URL` | Application URL (default: http://localhost:3000) |
