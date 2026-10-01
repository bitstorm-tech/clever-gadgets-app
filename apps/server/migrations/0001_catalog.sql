-- Catalog: niches (e.g. cats) and their gadgets. Every gadget has its own page.
-- UUID primary keys use gen_random_uuid(), built in since PostgreSQL 13 (no extension needed).

create table niches (
  id uuid primary key default gen_random_uuid(),
  -- Part of the page URL, e.g. /cats
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null,
  tagline text not null,
  description text not null,
  emoji text not null,
  accent_color text not null check (accent_color ~ '^#[0-9a-fA-F]{6}$'),
  sort_order integer not null default 0,
  -- Only published niches are visible through the API.
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table gadgets (
  id uuid primary key default gen_random_uuid(),
  niche_id uuid not null references niches (id),
  -- Part of the page URL, e.g. /cats/water-fountain. Unique within the niche.
  slug text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null,
  tagline text not null,
  -- Running text; paragraphs are separated by a blank line.
  description text not null,
  -- Short bullet points as a JSON array of strings.
  highlights jsonb not null default '[]' check (jsonb_typeof(highlights) = 'array'),
  -- Absolute http(s) URL or a path on this site (e.g. /images/gadgets/foo.jpg).
  image_url text check (image_url ~ '^(https?://|/[^/])'),
  merchant_name text not null,
  -- The affiliate link to the merchant's page.
  affiliate_url text not null check (affiliate_url ~ '^https?://'),
  sort_order integer not null default 0,
  -- Only published gadgets in published niches are visible through the API.
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- This index also covers queries by niche_id.
  unique (niche_id, slug)
);
