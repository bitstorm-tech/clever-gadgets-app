export interface SeedGadget {
  slug: string;
  name: string;
  tagline: string;
  /** Absätze sind durch eine Leerzeile getrennt. */
  description: string;
  highlights: string[];
  imageUrl: string | null;
  merchantName: string;
  affiliateUrl: string;
}

export interface SeedNiche {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  emoji: string;
  accentColor: string;
  gadgets: SeedGadget[];
}

/**
 * Beispieldaten für die Entwicklung (`bun run seed`, läuft auch bei `bun run dev`).
 * Texte und Links sind Platzhalter: Es gibt keine echten Produkte, die Affiliate-Links zeigen auf example.com.
 * In Produktion wird nichts davon geladen.
 */
export const SAMPLE_CATALOG: SeedNiche[] = [
  {
    slug: "katzen",
    name: "Katzen",
    tagline: "Gadgets für Samtpfoten und ihre Menschen",
    description:
      "Spielzeug, das fordert. Technik, die Arbeit abnimmt. Hier findest du ausgewählte Gadgets, die den Alltag mit Katze leichter und schöner machen.",
    emoji: "🐱",
    accentColor: "#b8a1ff",
    gadgets: [
      {
        slug: "trinkbrunnen",
        name: "Katzen-Trinkbrunnen",
        tagline: "Fließendes Wasser statt stehendem Napf.",
        description:
          "Viele Katzen trinken zu wenig. Ein Trinkbrunnen hält das Wasser in Bewegung, und das macht es für viele Tiere interessanter als ein stiller Napf.\n\nEin Filter fängt Haare und Schwebteilchen ab. Die Pumpe läuft leise, damit auch Katzen mit feinen Ohren entspannt bleiben.",
        highlights: [
          "Fließendes Wasser lädt zum Trinken ein",
          "Filter hält das Wasser länger frisch",
          "Läuft leise im Hintergrund",
          "Zum Reinigen leicht auseinanderzunehmen",
        ],
        imageUrl: null,
        merchantName: "Beispiel-Shop",
        affiliateUrl: "https://example.com/katzen-trinkbrunnen",
      },
      {
        slug: "laserspielzeug",
        name: "Automatisches Laserspielzeug",
        tagline: "Beschäftigt deine Katze, auch wenn du arbeitest.",
        description:
          "Ein kleiner Lichtpunkt huscht in zufälligen Mustern über den Boden. Das weckt den Jagdinstinkt und bringt Bewegung in den Tag.\n\nNach einer festen Zeit schaltet sich das Gerät von selbst ab. So bleibt das Spiel ein Spiel und wird nicht zur Dauerjagd.",
        highlights: [
          "Zufällige Bewegungsmuster",
          "Schaltet sich nach der Spielzeit selbst ab",
          "Einfach aufstellen und einschalten",
        ],
        imageUrl: null,
        merchantName: "Beispiel-Shop",
        affiliateUrl: "https://example.com/katzen-laserspielzeug",
      },
      {
        slug: "selbstreinigende-katzentoilette",
        name: "Selbstreinigende Katzentoilette",
        tagline: "Weniger Schaufeln, mehr Kuscheln.",
        description:
          "Nach jedem Besuch sortiert die Toilette Klumpen automatisch in einen geschlossenen Behälter. Den leerst du nur noch ab und zu.\n\nDas spart Zeit und hält die Wohnung angenehmer, vor allem in kleinen Räumen.",
        highlights: [
          "Klumpen werden automatisch entfernt",
          "Geschlossener Behälter bindet Gerüche",
          "Weniger Handarbeit im Alltag",
        ],
        imageUrl: null,
        merchantName: "Beispiel-Shop",
        affiliateUrl: "https://example.com/katzen-toilette",
      },
    ],
  },
];
