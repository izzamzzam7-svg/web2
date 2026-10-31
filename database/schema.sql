-- XYLER DIGITAL STORE starter schema for Supabase/PostgreSQL
-- Review and apply only after creating a Supabase project.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  email text,
  created_at timestamptz not null default now()
);

create table if not exists public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'user' check (role in ('owner','admin','user'))
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id),
  name text not null,
  description text,
  selling_price bigint not null default 0 check (selling_price >= 0),
  supplier_code text,
  is_active boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  product_id uuid references public.products(id),
  destination text not null,
  amount bigint not null check (amount >= 0),
  status text not null default 'pending' check (status in ('pending','paid','processing','success','failed','cancelled')),
  created_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id),
  provider text,
  provider_reference text unique,
  method text,
  amount bigint not null check (amount >= 0),
  status text not null default 'pending' check (status in ('pending','paid','failed','expired','refunded')),
  created_at timestamptz not null default now()
);

create table if not exists public.supplier_transactions (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id),
  supplier_name text,
  supplier_reference text unique,
  status text not null default 'pending',
  response_summary jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  image_url text,
  is_active boolean not null default true,
  sort_order integer not null default 0
);

create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- IMPORTANT:
-- Configure Row Level Security and policies before production use.
-- Never expose service_role keys in frontend code.
-- Assign the first owner manually through a trusted server-side process.
