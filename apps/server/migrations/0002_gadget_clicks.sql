-- Clicks on a gadget's affiliate link, to see what sends visitors to the merchant.
-- Deliberately free of personal data: no IP address, no user agent, no identifier.
-- Only the gadget, the time, and the origin from the UTM parameters are stored.

create table gadget_clicks (
  id uuid primary key default gen_random_uuid(),
  gadget_id uuid not null references gadgets (id) on delete cascade,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  clicked_at timestamptz not null default now()
);

create index gadget_clicks_gadget_id_clicked_at_idx on gadget_clicks (gadget_id, clicked_at);
