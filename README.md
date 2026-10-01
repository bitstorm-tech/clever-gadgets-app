# Clever Gadgets

A web app with hand-picked everyday gadgets. Visitors find gadgets, each with its own page, and go from there to the seller's site. We earn a commission on purchases made there (affiliate marketing).

The site covers several **niches** (cats, dogs, garden, home, kitchen, …). Each niche has several gadgets, but every page is about exactly one gadget. Each niche gets its own Instagram and TikTok accounts that bring visitors to the matching pages with videos. We start with the **cats** niche.

## Language

The target region is the USA and the audience is English-speaking. Everything visitors see is in US English. All code, comments, identifiers, test data, and documentation are in English too.

## Requirements

- [Bun](https://bun.sh) 1.4.2 (pinned in `package.json`)
- Docker with the Compose plugin (`docker compose`)

## Getting started

```sh
bun install
bun run dev
```

`bun run dev` starts PostgreSQL (docker compose, host port **5434**), applies the migrations, loads the sample data, and starts the server at <http://localhost:3100> and the web client at <http://localhost:5174>. The client forwards `/api` to the server (the target can be changed with `CLEVER_GADGETS_API_URL`). `Ctrl+C` also stops the database container.

Health check: <http://localhost:3100/api/v1/health>

The ports deliberately differ from Finifeed (3000, 5173, 5433) so that both projects can run at the same time.

## Commands

| Command | What it does |
|---|---|
| `bun run dev` | Database + sample data + server (watch mode) + web client |
| `bun run db:up` / `bun run db:down` | Start / stop the local database |
| `bun run migrate` | Apply pending migrations without starting the server |
| `bun run seed` | Apply migrations and load the sample data (aborts in production) |
| `bun run test` | All tests (integration tests start their own PostgreSQL via Testcontainers, so Docker must be running) |
| `bun run typecheck` | Type-check all packages |
| `bun run build` | Production build of the web client |
| `bun run ci` | Typecheck + tests + build, as in CI |

## Pages

| URL | Content |
|---|---|
| `/` | Home page with all niches |
| `/cats` | One niche with its gadgets |
| `/cats/water-fountain` | The page of one gadget, with the button to the seller |
| `/legal-notice`, `/privacy-policy` | Placeholders, the texts are still missing |

The URLs are built from the `slug` fields of the niche and the gadget.

## API

Everything lives under `/api/v1`. Responses and errors are described as Zod schemas in `packages/shared`.

| Request | Response |
|---|---|
| `GET /health` | State of the server and the database |
| `GET /niches` | Published niches with the number of their gadgets |
| `GET /niches/:nicheSlug` | One niche with its published gadgets |
| `GET /niches/:nicheSlug/gadgets/:gadgetSlug` | One gadget with its affiliate link |
| `POST /niches/:nicheSlug/gadgets/:gadgetSlug/clicks` | Counts a click on the affiliate link (`204`) |

Only published content is visible (`is_published`), and a gadget only if its niche is published too.

## Affiliate clicks

- The button on the gadget page is a **direct link** to the seller (`rel="sponsored nofollow noopener"`, new tab), not a detour through our server. It keeps working even if click counting fails.
- On click, the page reports the click to `POST …/clicks`. Only the gadget, the time, and `utm_source`, `utm_medium`, `utm_campaign` from the entry URL are stored. No IP address, no user agent, no cookies, nothing in local storage. The page keeps the UTM values in memory only.
- To see where clicks come from, build links in Instagram and TikTok with UTM parameters:
  `https://<domain>/cats/water-fountain?utm_source=instagram&utm_medium=social&utm_campaign=cats-reel-1`
- Reporting:

```sql
select g.slug, c.utm_source, c.utm_campaign, count(*) as clicks
from gadget_clicks c
join gadgets g on g.id = c.gadget_id
group by 1, 2, 3
order by clicks desc;
```

## Managing content

There is no admin interface yet. Niches and gadgets live in the tables `niches` and `gadgets`.

- **Sample data** lives in `apps/server/src/seed/sample-catalog.ts`. It is placeholder content (no real product, links point to `example.com`). It is only loaded in development, never in production.
- **Add a gadget with SQL:**

```sql
insert into gadgets (niche_id, slug, name, tagline, description, highlights, image_url, merchant_name, affiliate_url, is_published)
select id, 'scratching-post', 'Scratching Post XL', 'Room to climb.',
       E'First paragraph.\n\nSecond paragraph.',
       '["Sturdy", "Tall"]', '/images/gadgets/scratching-post.jpg',
       'My Merchant', 'https://example.com/my-affiliate-link', true
from niches where slug = 'cats';
```

- **Images:** `image_url` is an absolute `https://` URL or a path like `/images/gadgets/scratching-post.jpg` (the file then goes in `apps/web/public/images/gadgets/`). Without an image, the page shows a tile with the niche's emoji.
- **Description:** plain text, paragraphs separated by a blank line.
- **New niche:** a row in `niches` with `slug`, `name`, `tagline`, `description`, `emoji`, `accent_color` (hex, e.g. `#b8a1ff`) and `is_published = true`. The accent color shapes the pages of the niche; the yellow button stays the same everywhere.

## Configuration

The server reads environment variables (see [`.env.example`](.env.example)). No configuration is needed in development. To override values, create `apps/server/.env`. In production, `APP_ENV=production` and `DATABASE_URL` are required.

## Tests

`bun run test` starts PostgreSQL via Testcontainers, so Docker must be running. Without Docker, an already running PostgreSQL server can be used:

```sh
TEST_POSTGRES_URL=postgres://user:password@localhost:5432/postgres bun run test
```

The tests only create databases named `test_<uuid>` there and drop them again. Other databases are left untouched.

## Structure

```text
apps/server/       Bun + Hono backend
  migrations/      SQL migrations (NNNN_description.sql), never change them after applying
  src/             Feature folders (catalog/, clicks/, seed/, health/, database/, config/, http/, …)
apps/web/          Vue 3 + Vite frontend
packages/shared/   API contract: types, Zod schemas, error codes
```

## Migrations

Create a new file `apps/server/migrations/NNNN_description.sql` with the next number. Each file runs in its own transaction. The runner stores a checksum and refuses to start if an already applied migration was changed. Migrations run automatically on server start.

## Not included yet

- Admin interface for managing niches and gadgets
- Texts for the legal notice and the privacy policy (required before going live)
- Link previews (Open Graph) per gadget: the site is a pure browser app, so shared links show the same preview everywhere
- Production delivery: the server does not serve the built frontend yet, and there is no deployment
- Protection of the click endpoint against abuse (e.g. rate limiting)
