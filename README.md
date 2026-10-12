# Triple Fins Swim Program — Web Platform

Modern, full-stack web platform for **Triple Fins Swim Program** built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, **Supabase** (Database/Auth), **Resend** (Transactional Emails), and ready for **Vercel** deployment.

---

## 🏊‍♂️ Core Features

1. **High-Performance Marketing & Brand Identity**:
   - Signature Triple Fins angular geometry, custom color tokens, responsive layout, and optimized media assets.
   - Core training pillars (*Technique, Endurance, Discipline*).
   - Program highlights (*Sunday Swim Club*, *Summer Swim Intensive*).
2. **Merchandise Store & Cart Drawer**:
   - Interactive store grid with category & tier filters (*Kids/Athlete, Supporters, Everyday*).
   - Slide-out cart drawer with local storage persistence and subtotal calculation in **JMD**.
3. **Live Inquiry & Registration Engine**:
   - Fully connected contact form submitting to `/api/contact`.
   - Records saved directly into **Supabase** database (`inquiries` table).
   - Automated notification email dispatched to coaches/admin via **Resend**.
   - Branded confirmation receipt sent immediately to the user.
4. **Production Architecture**:
   - TypeScript type safety, Next.js serverless route handlers, and Vercel CI/CD readiness.

---

## 🚀 Quick Start (Local Development)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Fill in your Supabase and Resend credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

RESEND_API_KEY=re_your_resend_api_key
RESEND_FROM_EMAIL="Triple Fins Swim <onboarding@resend.dev>"
CONTACT_NOTIFICATION_EMAIL="triplefinsswimpro@pointglobalmarketing.com"
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗄️ Supabase Setup (Database)

1. Create a project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Open [`supabase/schema.sql`](./supabase/schema.sql), copy its contents, and click **Run**.
4. This will create:
   - `inquiries` table (with status tracking).
   - `registrations` table (for Sunday Swim & Camp RSVPs).
   - `products` table (pre-seeded with the 16 merchandise items).
   - Row Level Security (RLS) policies.
5. Retrieve your project URL and API keys from **Project Settings > API** and add them to `.env.local`.

---

## 📧 Resend Setup (Transactional Emails)

1. Create an account at [resend.com](https://resend.com) and generate an API key.
2. For testing, you can send emails from `onboarding@resend.dev`.
3. For production, add your custom domain (e.g. `triplefins.com` or `pointglobalmarketing.com`) in Resend DNS settings.
4. Add `RESEND_API_KEY` to your environment variables.

---

## 🌐 Vercel Deployment

### Option A: Via GitHub (Recommended)
1. Push your repository to GitHub:
   ```bash
   git remote add origin https://github.com/<your-username>/triple-fins-website.git
   git push -u origin main
   ```
2. Log in to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your `triple-fins-website` repository.
4. Under **Environment Variables**, add the values from `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `RESEND_API_KEY`
   - `RESEND_FROM_EMAIL`
   - `CONTACT_NOTIFICATION_EMAIL`
5. Click **Deploy**. Vercel will automatically build and assign a global SSL production URL.

### Option B: Via Vercel CLI
```bash
npx vercel
# Follow the interactive prompts to link and deploy
```

---

## 📁 Project Structure

```
triple-fins-website/
├── public/                     # Static assets & brand media
│   ├── brand-assets/           # Wordmarks and logo files
│   └── images/                 # Optimized camp & swim photography
├── src/
│   ├── app/
│   │   ├── api/contact/        # /api/contact route handler (Supabase + Resend)
│   │   ├── globals.css         # Custom brand tokens & fin clip-paths
│   │   ├── layout.tsx          # Root layout & Google Fonts
│   │   └── page.tsx            # Main homepage component
│   ├── components/             # Modular UI components
│   │   ├── Navbar.tsx
│   │   ├── Hero.tsx
│   │   ├── Pillars.tsx
│   │   ├── Programs.tsx
│   │   ├── Shop.tsx
│   │   ├── CartDrawer.tsx
│   │   ├── About.tsx
│   │   ├── Contact.tsx
│   │   └── Footer.tsx
│   ├── lib/
│   │   ├── supabase.ts         # Supabase client & service helpers
│   │   └── resend.ts           # Resend email dispatch & HTML templates
│   └── types/                  # TypeScript interfaces (Product, Cart, Inquiry)
├── supabase/
│   └── schema.sql              # PostgreSQL DDL & RLS policies
├── .env.example                # Example environment variables
└── package.json
```

---
## Operational flows

- Program CTAs open the registration form with the chosen program selected.
- Registrations are validated and persisted before email or payment is attempted.
- Stripe-hosted Checkout handles configured online payments. The signed webhook at `/api/webhooks/stripe` is the payment source of truth.
- Bank transfer/manual verification and pay-on-site remain available without Stripe.
- Merchandise is loaded from the Supabase `products` table. Checkout creates an order and immutable line-item price snapshots after validating current server-side prices.
- Authorized staff can sign in at `/admin` to review registrations and inquiries and update operational statuses.

## Database migrations and staff setup

Production migration application requires explicit approval. For an approved environment, apply migrations in chronological order with the Supabase CLI (`supabase db push`); the first migration is `supabase/migrations/202609280001_operational_loop.sql` in the SQL editor. The migration adds payment and registration metadata, staff roles, orders, order items, analytics events, indexes, and restrictive RLS policies.

Create a staff user in Supabase Auth, then authorize the user using their UUID:

```sql
insert into public.staff_roles (user_id, role)
values ('AUTH_USER_UUID', 'admin');
```

Authentication alone does not grant customer-record access; the user must have a `staff_roles` row.

## Stripe setup

Stripe is optional for a manual-payment launch. To enable **Pay online**, configure `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and positive JMD prices for each program in `.env.local`. Prefer a restricted (`rk_`) server key. Do not expose secret keys to the browser.

Create a Stripe webhook endpoint for `https://YOUR_DOMAIN/api/webhooks/stripe` and subscribe to:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `checkout.session.async_payment_failed`

Checkout uses dynamic payment methods configured in Stripe. Paid fulfillment/status is driven by verified webhook events, never by the success page.

## Order workflow

### Product and order management

Authorized staff can use Store Management at `/admin` to create/edit products,
change descriptions and JMD prices, hide/unhide listings, reorder listings and
gallery images, and upload JPEG/PNG/WebP images (up to 5 MB) to the staff-protected
`product-images` storage bucket. Staff can review order line items and update
payment and fulfillment statuses. Hide retired products to retain order history.

Apply `supabase/migrations/20261009163453_merchandise_catalog.sql` after the
operational-loop migration. It adds 12 mockup products using all 16 supplied
images. Hummingbird front/back pairs and alternate parka shots share galleries;
the Year One black tees have different chest graphics and are separate products.
Existing merchandise is preserved.

Prices on these new products are deliberately provisional. They are displayed
for review, with checkout disabled in both the UI and order API until staff
approve the price by clearing the provisional-price flag. Newly created products also require confirmed availability, approved public content and approved variants. Descriptions describe
the mockups; material, sizing and performance specifications still need supplier
confirmation. The store collects configured size variants on product pages, validates them again in the atomic checkout function, and snapshots the selected size on each order line. Empty size lists mean no size applies only after staff approve variants.

Web image copies total under 1 MB. Rebuild them with
`node scripts/prepare-product-images.cjs "/path/to/Apparel Mockups"`.

Customers enter contact details, choose pickup or delivery coordination, and select Stripe, bank transfer, or pay on pickup. Order totals are calculated from active Supabase products on the server. This release intentionally does not add complex inventory management.

## Verification

```bash
npm install
npm run test
npm run typecheck
npm run lint
npm run build
```

*A Point Global Marketing initiative · Swim Strong. Play Hard. Build Champions.*


## Supplier catalogue review (Javette workbook)

See [catalogue review and import instructions](docs/catalogue-review.md). The importer
prepares 66 distinct planned SKUs without replacing the 16 seed or 12 mockup products.
Core previews are visible; Phase 2 is hidden. Neither phase implies stock or approval.
Unknown prices display as **Price pending**, never zero/free. All new rows remain
non-orderable until price, availability/fulfilment, variants and public content are approved.
Supplier/commercial data lives in `catalogue_private`, with no anonymous or browser
staff privileges. Never place it in `public.products`, descriptions or client code.

The catalogue migration preserves existing products' prior purchase eligibility;
legacy approval defaults are compatibility flags, not new supplier certifications.
Existing provisional prices are still rejected. Stripe and production readiness
remain separate work and are not certified by this catalogue change.

Additional isolated database verification (Docker required):

```bash
node scripts/test-catalogue-db.mjs
# Optional: validate the actual source without committing or printing it
node scripts/test-catalogue-db.mjs /private/workbook.json
```
