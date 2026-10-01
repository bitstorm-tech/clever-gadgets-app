export interface SeedGadget {
  slug: string;
  name: string;
  tagline: string;
  /** Paragraphs are separated by a blank line. */
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
 * Sample data for development (`bun run seed`, also runs with `bun run dev`).
 * Texts and links are placeholders: there are no real products, and the affiliate links point to example.com.
 * None of this is loaded in production.
 */
export const SAMPLE_CATALOG: SeedNiche[] = [
  {
    slug: "cats",
    name: "Cats",
    tagline: "Gadgets for cats and their humans",
    description:
      "Toys that challenge. Tech that takes work off your hands. Here you'll find hand-picked gadgets that make everyday life with a cat easier and nicer.",
    emoji: "🐱",
    accentColor: "#b8a1ff",
    gadgets: [
      {
        slug: "water-fountain",
        name: "Cat Water Fountain",
        tagline: "Flowing water instead of a still bowl.",
        description:
          "Many cats don't drink enough. A water fountain keeps the water moving, and that makes it more interesting to many animals than a still bowl.\n\nA filter catches hair and floating particles. The pump runs quietly, so even cats with sensitive ears stay relaxed.",
        highlights: [
          "Flowing water invites cats to drink",
          "Filter keeps the water fresh longer",
          "Runs quietly in the background",
          "Easy to take apart for cleaning",
        ],
        imageUrl: null,
        merchantName: "Example Shop",
        affiliateUrl: "https://example.com/cat-water-fountain",
      },
      {
        slug: "laser-toy",
        name: "Automatic Laser Toy",
        tagline: "Keeps your cat busy, even while you work.",
        description:
          "A small dot of light darts across the floor in random patterns. It awakens the hunting instinct and brings some movement into the day.\n\nAfter a set time, the device switches itself off. That way play stays play and never turns into a nonstop chase.",
        highlights: [
          "Random movement patterns",
          "Switches itself off after playtime",
          "Just set it up and switch it on",
        ],
        imageUrl: null,
        merchantName: "Example Shop",
        affiliateUrl: "https://example.com/cat-laser-toy",
      },
      {
        slug: "self-cleaning-litter-box",
        name: "Self-Cleaning Litter Box",
        tagline: "Less scooping, more cuddling.",
        description:
          "After every visit, the litter box sorts clumps into a closed container automatically. You only have to empty it once in a while.\n\nThat saves time and keeps your home more pleasant, especially in small spaces.",
        highlights: [
          "Clumps are removed automatically",
          "Sealed container traps odors",
          "Less manual work day to day",
        ],
        imageUrl: null,
        merchantName: "Example Shop",
        affiliateUrl: "https://example.com/cat-litter-box",
      },
    ],
  },
];
