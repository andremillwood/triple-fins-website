-- ==============================================================================
-- TRIPLE FINS SWIM PROGRAM - SUPABASE DATABASE SCHEMA
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Inquiries Table (Contact Form & Program Enquiries)
CREATE TABLE IF NOT EXISTS public.inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    message TEXT NOT NULL,
    program_interest TEXT DEFAULT 'General Inquiry',
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'resolved', 'archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Program Registrations Table (Sunday Swim & Summer Camp RSVPs)
CREATE TABLE IF NOT EXISTS public.registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    program_type TEXT NOT NULL CHECK (program_type IN ('sunday_swim', 'summer_camp', 'private_coaching')),
    participant_name TEXT NOT NULL,
    participant_age INTEGER,
    parent_name TEXT,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    swimming_level TEXT CHECK (swimming_level IN ('beginner', 'intermediate', 'advanced')),
    medical_notes TEXT,
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'waived', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Products Table (Merchandise Store)
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    tier TEXT NOT NULL CHECK (tier IN ('athlete', 'supporter', 'everyday')),
    price_jmd NUMERIC(10, 2) NOT NULL,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Seed Initial Products Data
INSERT INTO public.products (name, category, tier, price_jmd, sort_order) VALUES
('Kids Team Tee', 'T-Shirt', 'athlete', 2500, 1),
('Kids Hoodie', 'Hoodie', 'athlete', 4800, 2),
('Rashguard Swim Shirt', 'Swim', 'athlete', 3900, 3),
('Youth Training Jersey', 'Jersey', 'athlete', 3600, 4),
('Kids Drawstring Bag', 'Kit Bag', 'athlete', 1800, 5),
('Supporter Tee', 'T-Shirt', 'supporter', 2900, 6),
('Zip Hoodie', 'Hoodie', 'supporter', 5600, 7),
('Triple Fins Cap', 'Cap', 'supporter', 2400, 8),
('Team Socks', 'Socks', 'supporter', 1500, 9),
('Tote Bag', 'Tote', 'supporter', 2000, 10),
('Swim Cap', 'Swim', 'everyday', 1600, 11),
('Quick-Dry Towel', 'Towel', 'everyday', 2600, 12),
('Water Bottle', 'Bottle', 'everyday', 2200, 13),
('Sticker Pack', 'Stickers', 'everyday', 800, 14),
('Fins Water Shorts', 'Swim', 'everyday', 3400, 15),
('Coach Polo', 'Polo', 'supporter', 4200, 16)
ON CONFLICT DO NOTHING;

-- 6. Row Level Security (RLS) Policies
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Inquiries: Allow anonymous public insertions
CREATE POLICY "Allow public insert to inquiries" 
ON public.inquiries FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

-- Inquiries: Read allowed only for service_role or authenticated staff
CREATE POLICY "Allow authenticated read inquiries" 
ON public.inquiries FOR SELECT 
TO authenticated 
USING (true);

-- Registrations: Allow anonymous public insertions
CREATE POLICY "Allow public insert to registrations" 
ON public.registrations FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

-- Products: Allow public read access to active products
CREATE POLICY "Allow public read active products" 
ON public.products FOR SELECT 
TO anon, authenticated 
USING (is_active = true);
