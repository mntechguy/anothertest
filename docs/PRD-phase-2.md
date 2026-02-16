# OpenClaw SaaS — Phase 2 PRD

**Product Requirements Document**
**Version:** 1.0
**Date:** 2026-02-16

---

## 1. Overview

Phase 1 delivered a marketing landing page, plan selection, and Stripe Checkout flow. Phase 2 builds on that foundation with four features that close the gap between "user paid" and "user is productive":

1. **OpenClaw Backend Integration** — Wire up actual instance provisioning and lifecycle management
2. **User Dashboard** — An authenticated post-login experience for managing instances, API keys, and billing
3. **Admin Panel** — Internal tooling for monitoring users, subscriptions, and system health
4. **Email Verification** — Confirm user identity before provisioning resources

These features turn the current checkout-only flow into a functional SaaS product.

---

## 2. Goals & Non-Goals

### Goals
- A user who completes checkout lands in a working dashboard within 60 seconds
- Admins can view, search, and manage all users and subscriptions from a single panel
- Email verification prevents resource provisioning for unverified accounts
- OpenClaw instances are provisioned, monitored, and deprovisioned via a backend integration layer

### Non-Goals (deferred to Phase 3+)
- Multi-tenant team/org support
- Custom domain mapping for user instances
- Real-time usage metering pipeline (Managed AI usage billing is tracked but not yet metered live)
- Public API / developer SDK
- SSO / OAuth providers (Google, GitHub login)

---

## 3. Architecture Decisions

### Database
- **Prisma ORM** with PostgreSQL
- Tables: `User`, `Subscription`, `Instance`, `VerificationToken`, `AuditLog`
- Connection via `DATABASE_URL` env var

### Authentication
- **NextAuth.js (Auth.js v5)** with credentials provider (email + password)
- Session strategy: JWT (stateless, no session table needed)
- Passwords hashed with bcrypt
- Protected routes via Next.js middleware

### OpenClaw Backend
- Integration via a `src/lib/openclaw.ts` service module
- All calls to the OpenClaw backend go through this abstraction
- Placeholder/mock implementation for now (interface-first), swappable for real API calls

### Email
- Abstracted behind `src/lib/email.ts`
- Placeholder implementation that logs to console in dev
- Interface ready for SendGrid/Resend/SES plug-in

---

## 4. Feature Specifications

---

### 4.1 OpenClaw Backend Integration

**Purpose:** Provision, configure, and manage OpenClaw instances tied to user subscriptions.

#### 4.1.1 Data Model

```
model Instance {
  id            String   @id @default(cuid())
  userId        String   @unique
  user          User     @relation(fields: [userId], references: [id])
  plan          String                      // "byok" | "managed"
  status        String   @default("provisioning") // provisioning | active | suspended | deprovisioned
  region        String   @default("us-east-1")
  endpoint      String?                     // assigned after provisioning
  apiKeyHash    String?                     // user's BYOK API key (encrypted)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

#### 4.1.2 Service Interface (`src/lib/openclaw.ts`)

| Method | Description |
|---|---|
| `provisionInstance(userId, plan)` | Creates a new OpenClaw instance. Returns instance ID and endpoint. |
| `deprovisionInstance(instanceId)` | Tears down the instance and cleans up resources. |
| `suspendInstance(instanceId)` | Pauses an instance (e.g., payment failed). |
| `resumeInstance(instanceId)` | Resumes a suspended instance. |
| `getInstanceStatus(instanceId)` | Returns current status, endpoint, and health. |
| `updateApiKey(instanceId, apiKey)` | Stores/updates the user's BYOK API key (encrypted). |

**Placeholder behavior:** All methods resolve successfully with mock data. `provisionInstance` sets a 3-second delay to simulate real provisioning, then sets status to `active` and assigns a mock endpoint URL.

#### 4.1.3 Webhook Integration

Update the existing `/api/webhook` route to call the service layer:

| Stripe Event | Action |
|---|---|
| `checkout.session.completed` | Create `User` + `Instance` records, call `provisionInstance()`, send welcome email |
| `customer.subscription.updated` | Update `Instance.plan`, call `resumeInstance()` if reactivating |
| `customer.subscription.deleted` | Call `deprovisionInstance()`, update `Instance.status` |
| `invoice.payment_failed` | Call `suspendInstance()`, send payment-failed email |

---

### 4.2 User Dashboard

**Purpose:** Authenticated area where users manage their OpenClaw instance, API keys, and billing after signing in.

#### 4.2.1 Routes

| Route | Description | Auth Required |
|---|---|---|
| `/login` | Email + password sign-in form | No |
| `/dashboard` | Main dashboard overview | Yes |
| `/dashboard/settings` | API key management, account settings | Yes |
| `/dashboard/billing` | Subscription info, invoices, plan change | Yes |

#### 4.2.2 `/login`

- Email + password form (similar styling to `/signup`)
- On success, redirect to `/dashboard`
- "Forgot password?" link (placeholder — no-op for now)
- "Don't have an account? Sign up" link

#### 4.2.3 `/dashboard` (Overview)

**Layout:**
- Sidebar navigation: Overview, Settings, Billing, Support (placeholder)
- Top bar: User email, sign-out button

**Content — Instance Card:**
- Instance status badge (provisioning / active / suspended)
- Endpoint URL (copyable) — shown when active
- Plan name and tier
- Region
- Created date
- Quick-action button: "Manage API Key" → links to Settings

**Content — Quick Stats (placeholder values):**
- Requests today: `—`
- Avg latency: `—`
- Uptime: `—`

*Stats are placeholder UI elements. Real metrics are Phase 3.*

#### 4.2.4 `/dashboard/settings`

- **API Key Management (BYOK users only)**
  - Input field to add/update their AI provider API key
  - Key is masked after saving (shows last 4 chars)
  - "Update Key" button calls `PATCH /api/instance/api-key`
  - Managed AI users see "Your AI is managed by us — no key needed"

- **Account Settings**
  - Display email (read-only for now)
  - Change password form (current password + new password)

#### 4.2.5 `/dashboard/billing`

- Current plan name + price
- Subscription status (active / past_due / cancelled)
- Next billing date
- "Switch Plan" button — redirects to a Stripe Customer Portal session (`/api/billing/portal`)
- Recent invoices list (fetched from Stripe)

#### 4.2.6 API Routes

| Route | Method | Description |
|---|---|---|
| `/api/instance/api-key` | `PATCH` | Update BYOK API key |
| `/api/instance/status` | `GET` | Get current instance status |
| `/api/billing/portal` | `POST` | Create Stripe Customer Portal session, return URL |
| `/api/auth/[...nextauth]` | `*` | NextAuth.js handler |

---

### 4.3 Admin Panel

**Purpose:** Internal-only panel for the team to monitor and manage users, subscriptions, and instances.

#### 4.3.1 Access Control

- Protected by a separate middleware check: `user.role === "admin"`
- `User` model gets a `role` field: `"user"` (default) | `"admin"`
- Admin users are seeded manually or via a `ADMIN_EMAILS` env var (comma-separated list of emails that auto-assign admin role on signup)

#### 4.3.2 Routes

| Route | Description |
|---|---|
| `/admin` | Dashboard overview — total users, active subscriptions, MRR, recent signups |
| `/admin/users` | Searchable, paginated user list |
| `/admin/users/[id]` | User detail — subscription, instance status, audit log |

#### 4.3.3 `/admin` (Overview)

Stat cards:
- Total users
- Active subscriptions (BYOK count, Managed count)
- MRR (Monthly Recurring Revenue) — computed from active subscriptions
- Signups this week

Recent signups table (last 10):
| Email | Plan | Status | Signed Up |
|---|---|---|---|

#### 4.3.4 `/admin/users`

- Search bar (by email)
- Sortable table: Email, Plan, Instance Status, Subscription Status, Created
- Pagination (20 per page)
- Row click → navigates to `/admin/users/[id]`

#### 4.3.5 `/admin/users/[id]`

- User info: email, role, created date, email verified status
- Subscription info: plan, Stripe customer ID (linked), status, current period end
- Instance info: status, endpoint, region, created date
- Actions:
  - "Suspend Instance" / "Resume Instance" button
  - "Deprovision Instance" button (with confirmation)
- Audit log (last 20 entries): timestamp, action, details

#### 4.3.6 API Routes

| Route | Method | Description |
|---|---|---|
| `/api/admin/stats` | `GET` | Aggregate stats for admin overview |
| `/api/admin/users` | `GET` | Paginated user list with search |
| `/api/admin/users/[id]` | `GET` | Single user detail |
| `/api/admin/users/[id]/suspend` | `POST` | Suspend user's instance |
| `/api/admin/users/[id]/resume` | `POST` | Resume user's instance |
| `/api/admin/users/[id]/deprovision` | `POST` | Deprovision user's instance |

All admin API routes check `user.role === "admin"` before processing.

---

### 4.4 Email Verification

**Purpose:** Confirm the user's email address before their OpenClaw instance is provisioned.

#### 4.4.1 Flow

```
Signup + Checkout → User created (emailVerified: null)
    ↓
Verification email sent with token link
    ↓
User clicks link → /verify-email?token=xxx
    ↓
Token validated → emailVerified set to now()
    ↓
Instance provisioning begins
```

#### 4.4.2 Data Model

```
model User {
  ...
  emailVerified  DateTime?               // null until verified
}

model VerificationToken {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  expiresAt DateTime                      // 24 hours from creation
  createdAt DateTime @default(now())
}
```

#### 4.4.3 Routes

| Route | Description |
|---|---|
| `/verify-email` | Page that reads `?token=` param, calls API to verify, shows success/error |
| `/verify-email/pending` | "Check your email" interstitial shown after signup |

#### 4.4.4 API Routes

| Route | Method | Description |
|---|---|---|
| `/api/auth/verify` | `POST` | Validates token, sets `emailVerified`, triggers provisioning |
| `/api/auth/resend-verification` | `POST` | Generates new token, sends new email |

#### 4.4.5 Email Service (`src/lib/email.ts`)

| Method | Description |
|---|---|
| `sendVerificationEmail(email, token)` | Sends email with verification link |
| `sendWelcomeEmail(email, plan)` | Sends welcome email after verification + provisioning |
| `sendPaymentFailedEmail(email)` | Notifies user of failed payment |

**Placeholder behavior:** All methods log the email subject, recipient, and body/link to the server console. No actual email is sent.

#### 4.4.6 Dashboard Gate

- If `emailVerified` is null, the dashboard shows a banner: "Please verify your email to activate your instance."
- The banner includes a "Resend verification email" button
- Instance status shows as `pending_verification` until email is confirmed

---

## 5. Data Model Summary

```
model User {
  id              String    @id @default(cuid())
  email           String    @unique
  passwordHash    String
  role            String    @default("user")    // "user" | "admin"
  emailVerified   DateTime?
  stripeCustomerId String?  @unique
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  instance        Instance?
  verificationTokens VerificationToken[]
}

model Instance {
  id            String   @id @default(cuid())
  userId        String   @unique
  user          User     @relation(fields: [userId], references: [id])
  plan          String                      // "byok" | "managed"
  status        String   @default("pending_verification")
  region        String   @default("us-east-1")
  endpoint      String?
  apiKeyHash    String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model VerificationToken {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  expiresAt DateTime
  createdAt DateTime @default(now())
}

model AuditLog {
  id        String   @id @default(cuid())
  userId    String
  action    String                          // e.g., "instance.provisioned", "apikey.updated"
  details   String?
  createdAt DateTime @default(now())
}
```

---

## 6. New Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Secret for JWT signing |
| `NEXTAUTH_URL` | App URL for NextAuth callbacks |
| `ADMIN_EMAILS` | Comma-separated list of emails granted admin role |
| `OPENCLAW_API_URL` | OpenClaw backend API base URL (for real integration) |
| `OPENCLAW_API_KEY` | Service-to-service auth key for OpenClaw backend |

---

## 7. New Dependencies

| Package | Purpose |
|---|---|
| `next-auth` | Authentication (credentials provider, JWT sessions) |
| `@prisma/client` | Database ORM |
| `prisma` (dev) | Prisma CLI for migrations |
| `bcryptjs` | Password hashing |
| `@types/bcryptjs` (dev) | Type definitions |

---

## 8. File Structure (New & Modified)

```
src/
├── app/
│   ├── login/page.tsx                          # NEW — Login form
│   ├── verify-email/
│   │   ├── page.tsx                            # NEW — Token verification
│   │   └── pending/page.tsx                    # NEW — "Check your email" page
│   ├── dashboard/
│   │   ├── layout.tsx                          # NEW — Sidebar + auth gate
│   │   ├── page.tsx                            # NEW — Overview
│   │   ├── settings/page.tsx                   # NEW — API key + account
│   │   └── billing/page.tsx                    # NEW — Subscription + invoices
│   ├── admin/
│   │   ├── layout.tsx                          # NEW — Admin layout + role gate
│   │   ├── page.tsx                            # NEW — Admin overview
│   │   └── users/
│   │       ├── page.tsx                        # NEW — User list
│   │       └── [id]/page.tsx                   # NEW — User detail
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/route.ts          # NEW — NextAuth handler
│   │   │   ├── verify/route.ts                 # NEW — Email verification
│   │   │   └── resend-verification/route.ts    # NEW — Resend token
│   │   ├── instance/
│   │   │   ├── api-key/route.ts                # NEW — BYOK key management
│   │   │   └── status/route.ts                 # NEW — Instance status
│   │   ├── billing/
│   │   │   └── portal/route.ts                 # NEW — Stripe Customer Portal
│   │   ├── admin/
│   │   │   ├── stats/route.ts                  # NEW — Admin aggregate stats
│   │   │   └── users/
│   │   │       ├── route.ts                    # NEW — User list
│   │   │       └── [id]/
│   │   │           ├── route.ts                # NEW — User detail
│   │   │           ├── suspend/route.ts        # NEW
│   │   │           ├── resume/route.ts         # NEW
│   │   │           └── deprovision/route.ts    # NEW
│   │   ├── checkout/route.ts                   # MODIFIED — Create user record
│   │   └── webhook/route.ts                    # MODIFIED — Call service layer
│   └── signup/page.tsx                         # MODIFIED — Redirect to /verify-email/pending
├── components/
│   ├── dashboard/
│   │   ├── Sidebar.tsx                         # NEW
│   │   ├── InstanceCard.tsx                    # NEW
│   │   └── StatsPlaceholder.tsx                # NEW
│   └── admin/
│       ├── AdminSidebar.tsx                    # NEW
│       ├── StatsCards.tsx                       # NEW
│       └── UserTable.tsx                       # NEW
├── lib/
│   ├── stripe.ts                               # EXISTS
│   ├── openclaw.ts                             # NEW — Instance lifecycle service
│   ├── email.ts                                # NEW — Email service (placeholder)
│   ├── auth.ts                                 # NEW — NextAuth config
│   └── db.ts                                   # NEW — Prisma client singleton
├── middleware.ts                                # NEW — Route protection
└── prisma/
    └── schema.prisma                           # NEW — Database schema
```

---

## 9. Implementation Order

| Phase | Scope | Depends On |
|---|---|---|
| **2a** | Prisma schema + DB setup, `db.ts` | — |
| **2b** | NextAuth config + middleware + `/login` | 2a |
| **2c** | Email verification flow (placeholder email) | 2a, 2b |
| **2d** | OpenClaw service module (`openclaw.ts`) + webhook integration | 2a |
| **2e** | User dashboard (layout, overview, settings, billing) | 2b, 2d |
| **2f** | Admin panel (layout, overview, user list, user detail, actions) | 2b, 2d |

Phases 2c and 2d can be developed in parallel. Phases 2e and 2f can be developed in parallel.

---

## 10. Open Questions

1. **Database hosting** — Should we add a `docker-compose.yml` for local PostgreSQL, or assume the developer has one running?
2. **Stripe Customer Portal** — Should plan switching go through Stripe's hosted portal or a custom in-app flow?
3. **Audit log granularity** — Should admin actions (suspend, resume, deprovision) also be logged, or only user-initiated events?
4. **Session duration** — How long should JWT sessions last before requiring re-login? (Recommendation: 7 days)
