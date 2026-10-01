-- Klicks auf den Affiliate-Link eines Gadgets, um zu sehen, was Besucher zum Anbieter bringt.
-- Bewusst ohne personenbezogene Daten: keine IP-Adresse, kein User-Agent, keine Kennung.
-- Gespeichert werden nur Gadget, Zeitpunkt und die Herkunft aus den UTM-Parametern.

create table gadget_clicks (
  id uuid primary key default gen_random_uuid(),
  gadget_id uuid not null references gadgets (id) on delete cascade,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  clicked_at timestamptz not null default now()
);

create index gadget_clicks_gadget_id_clicked_at_idx on gadget_clicks (gadget_id, clicked_at);
