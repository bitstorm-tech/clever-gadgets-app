-- Katalog: Nischen (z. B. Katzen) und ihre Gadgets. Jedes Gadget hat eine eigene Seite.
-- UUID-Primärschlüssel nutzen gen_random_uuid(), eingebaut ab PostgreSQL 13 (keine Extension nötig).

create table niches (
  id uuid primary key default gen_random_uuid(),
  -- Teil der Seitenadresse, z. B. /katzen
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null,
  tagline text not null,
  description text not null,
  emoji text not null,
  accent_color text not null check (accent_color ~ '^#[0-9a-fA-F]{6}$'),
  sort_order integer not null default 0,
  -- Nur veröffentlichte Nischen sind über die API sichtbar.
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table gadgets (
  id uuid primary key default gen_random_uuid(),
  niche_id uuid not null references niches (id),
  -- Teil der Seitenadresse, z. B. /katzen/trinkbrunnen. Eindeutig innerhalb der Nische.
  slug text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null,
  tagline text not null,
  -- Fließtext; Absätze sind durch eine Leerzeile getrennt.
  description text not null,
  -- Kurze Stichpunkte als JSON-Array von Texten.
  highlights jsonb not null default '[]' check (jsonb_typeof(highlights) = 'array'),
  -- Absolute http(s)-URL oder Pfad auf dieser Seite (z. B. /images/gadgets/foo.jpg).
  image_url text check (image_url ~ '^(https?://|/[^/])'),
  merchant_name text not null,
  -- Der Affiliate-Link zur Seite des Anbieters.
  affiliate_url text not null check (affiliate_url ~ '^https?://'),
  sort_order integer not null default 0,
  -- Nur veröffentlichte Gadgets in veröffentlichten Nischen sind über die API sichtbar.
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Dieser Index deckt auch Abfragen nach niche_id ab.
  unique (niche_id, slug)
);
