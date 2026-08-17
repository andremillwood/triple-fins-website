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
*A Point Global Marketing initiative · Swim Strong. Play Hard. Build Champions.*
