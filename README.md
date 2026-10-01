# Clever Gadgets

Eine Web-App mit ausgewählten Gadgets für den Alltag. Besucher finden hier Gadgets, jedes mit einer eigenen Seite, und kommen von dort auf die Seite des Anbieters. Für Käufe dort erhalten wir eine Provision (Affiliate-Marketing).

Die Seite deckt mehrere **Nischen** ab (Katzen, Hunde, Garten, Wohnen, Küche, …). Pro Nische gibt es mehrere Gadgets, aber jede Seite handelt von genau einem Gadget. Jede Nische bekommt eigene Instagram- und TikTok-Accounts, die Besucher mit Videos auf die jeweilige Seite bringen. Gestartet wird mit der Nische **Katzen**.

## Voraussetzungen

- [Bun](https://bun.sh) 1.4.2 (festgelegt in `package.json`)
- Docker mit dem Compose-Plugin (`docker compose`)

## Loslegen

```sh
bun install
bun run dev
```

`bun run dev` startet PostgreSQL (docker compose, Host-Port **5434**), wendet die Migrationen an, lädt die Beispieldaten und startet den Server auf <http://localhost:3100> und den Web-Client auf <http://localhost:5174>. Der Client leitet `/api` an den Server weiter (Ziel änderbar mit `CLEVER_GADGETS_API_URL`). Mit `Ctrl+C` wird auch der Datenbank-Container gestoppt.

Health-Check: <http://localhost:3100/api/v1/health>

Die Ports unterscheiden sich bewusst von Finifeed (3000, 5173, 5433), damit beide Projekte gleichzeitig laufen können.

## Befehle

| Befehl | Wirkung |
|---|---|
| `bun run dev` | Datenbank + Beispieldaten + Server (Watch-Modus) + Web-Client |
| `bun run db:up` / `bun run db:down` | Lokale Datenbank starten / stoppen |
| `bun run migrate` | Ausstehende Migrationen anwenden, ohne den Server zu starten |
| `bun run seed` | Migrationen anwenden und die Beispieldaten laden (bricht in Produktion ab) |
| `bun run test` | Alle Tests (Integrationstests starten ihr eigenes PostgreSQL über Testcontainers, Docker muss laufen) |
| `bun run typecheck` | Typen aller Pakete prüfen |
| `bun run build` | Produktions-Build des Web-Clients |
| `bun run ci` | Typecheck + Tests + Build, wie in der CI |

## Seiten

| Adresse | Inhalt |
|---|---|
| `/` | Startseite mit allen Nischen |
| `/katzen` | Eine Nische mit ihren Gadgets |
| `/katzen/trinkbrunnen` | Die Seite eines Gadgets, mit dem Button zum Anbieter |
| `/impressum`, `/datenschutz` | Platzhalter, die Texte fehlen noch |

Die Adressen entstehen aus den `slug`-Feldern von Nische und Gadget.

## API

Alles unter `/api/v1`. Antworten und Fehler sind in `packages/shared` als Zod-Schemas beschrieben.

| Aufruf | Antwort |
|---|---|
| `GET /health` | Zustand von Server und Datenbank |
| `GET /niches` | Veröffentlichte Nischen mit Anzahl ihrer Gadgets |
| `GET /niches/:nicheSlug` | Eine Nische mit ihren veröffentlichten Gadgets |
| `GET /niches/:nicheSlug/gadgets/:gadgetSlug` | Ein Gadget mit Affiliate-Link |
| `POST /niches/:nicheSlug/gadgets/:gadgetSlug/clicks` | Zählt einen Klick auf den Affiliate-Link (`204`) |

Sichtbar ist nur, was veröffentlicht ist (`is_published`), und ein Gadget nur, wenn auch seine Nische veröffentlicht ist.

## Affiliate-Klicks

- Der Button auf der Gadget-Seite ist ein **direkter Link** zum Anbieter (`rel="sponsored nofollow noopener"`, neuer Tab), kein Umweg über unseren Server. Er funktioniert auch, wenn die Zählung ausfällt.
- Beim Klick meldet die Seite den Klick an `POST …/clicks`. Gespeichert werden nur das Gadget, der Zeitpunkt und `utm_source`, `utm_medium`, `utm_campaign` aus der Einstiegsadresse. Keine IP-Adresse, kein User-Agent, keine Cookies, nichts im Local Storage. Die UTM-Werte merkt sich die Seite nur im Arbeitsspeicher.
- Zum Auswerten, woher Klicks kommen, Links in Instagram und TikTok mit UTM-Parametern bauen:
  `https://<domain>/katzen/trinkbrunnen?utm_source=instagram&utm_medium=social&utm_campaign=katzen-reel-1`
- Auswertung:

```sql
select g.slug, c.utm_source, c.utm_campaign, count(*) as klicks
from gadget_clicks c
join gadgets g on g.id = c.gadget_id
group by 1, 2, 3
order by klicks desc;
```

## Inhalte pflegen

Es gibt noch keine Admin-Oberfläche. Nischen und Gadgets liegen in den Tabellen `niches` und `gadgets`.

- **Beispieldaten** stehen in `apps/server/src/seed/sample-catalog.ts`. Das sind Platzhalter (kein echtes Produkt, Links zeigen auf `example.com`). Sie werden nur in der Entwicklung geladen, nie in Produktion.
- **Ein Gadget per SQL anlegen:**

```sql
insert into gadgets (niche_id, slug, name, tagline, description, highlights, image_url, merchant_name, affiliate_url, is_published)
select id, 'kratzbaum', 'Kratzbaum XL', 'Platz zum Klettern.',
       E'Erster Absatz.\n\nZweiter Absatz.',
       '["Stabil", "Hoch"]', '/images/gadgets/kratzbaum.jpg',
       'Mein Anbieter', 'https://example.com/mein-affiliate-link', true
from niches where slug = 'katzen';
```

- **Bilder:** `image_url` ist eine absolute `https://`-Adresse oder ein Pfad wie `/images/gadgets/kratzbaum.jpg` (Datei dann in `apps/web/public/images/gadgets/`). Ohne Bild zeigt die Seite eine Kachel mit dem Emoji der Nische.
- **Beschreibung:** reiner Text, Absätze durch eine Leerzeile getrennt.
- **Neue Nische:** Zeile in `niches` mit `slug`, `name`, `tagline`, `description`, `emoji`, `accent_color` (Hex, z. B. `#b8a1ff`) und `is_published = true`. Die Akzentfarbe prägt die Seiten der Nische, der gelbe Knopf bleibt überall gleich.

## Konfiguration

Der Server liest Umgebungsvariablen (siehe [`.env.example`](.env.example)). In der Entwicklung ist keine Konfiguration nötig. Zum Überschreiben `apps/server/.env` anlegen. In Produktion sind `APP_ENV=production` und `DATABASE_URL` Pflicht.

## Tests

`bun run test` startet PostgreSQL über Testcontainers, Docker muss laufen. Ohne Docker lässt sich ein schon laufender PostgreSQL-Server nutzen:

```sh
TEST_POSTGRES_URL=postgres://user:passwort@localhost:5432/postgres bun run test
```

Die Tests legen dort nur Datenbanken `test_<uuid>` an und löschen sie wieder. Andere Datenbanken bleiben unberührt.

## Aufbau

```text
apps/server/       Bun + Hono Backend
  migrations/      SQL-Migrationen (NNNN_beschreibung.sql), nach dem Anwenden nie ändern
  src/             Feature-Ordner (catalog/, clicks/, seed/, health/, database/, config/, http/, …)
apps/web/          Vue 3 + Vite Frontend
packages/shared/   API-Vertrag: Typen, Zod-Schemas, Fehlercodes
```

## Migrationen

Neue Datei `apps/server/migrations/NNNN_beschreibung.sql` mit der nächsten Nummer anlegen. Jede Datei läuft in einer eigenen Transaktion. Der Runner speichert eine Prüfsumme und startet nicht, wenn eine bereits angewendete Migration geändert wurde. Migrationen laufen beim Serverstart automatisch.

## Noch nicht enthalten

- Admin-Oberfläche zum Pflegen von Nischen und Gadgets
- Texte für Impressum und Datenschutz (vor dem Livegang nötig)
- Link-Vorschau (Open Graph) pro Gadget: Die Seite ist eine reine Browser-App, daher zeigen geteilte Links überall dieselbe Vorschau
- Auslieferung in Produktion: Der Server liefert das gebaute Frontend noch nicht aus, ein Deployment gibt es nicht
- Schutz des Klick-Endpunkts gegen Missbrauch (z. B. Rate-Limit)
