import { describe, expect, test } from "bun:test";
import { AccentColorSchema, HttpUrlSchema, ImageUrlSchema, SlugSchema } from "./catalog";

describe("HttpUrlSchema", () => {
  test("accepts http and https URLs", () => {
    expect(HttpUrlSchema.safeParse("https://example.com/p?tag=clever").success).toBe(true);
    expect(HttpUrlSchema.safeParse("http://example.com").success).toBe(true);
  });

  // Der Wert landet im href eines Links: andere Protokolle wären ein XSS-Einfallstor.
  test("rejects other protocols", () => {
    for (const url of ["javascript:alert(1)", "data:text/html,hi", "ftp://example.com/file", "not a url"]) {
      expect(HttpUrlSchema.safeParse(url).success).toBe(false);
    }
  });
});

describe("ImageUrlSchema", () => {
  test("accepts absolute http(s) URLs and site-relative paths", () => {
    expect(ImageUrlSchema.safeParse("https://cdn.example.com/a.jpg").success).toBe(true);
    expect(ImageUrlSchema.safeParse("/images/gadgets/a.jpg").success).toBe(true);
  });

  test("rejects protocol-relative URLs, other protocols and bare paths", () => {
    for (const url of ["//evil.example/a.jpg", "javascript:alert(1)", "images/a.jpg", "/with space.jpg"]) {
      expect(ImageUrlSchema.safeParse(url).success).toBe(false);
    }
  });
});

describe("SlugSchema", () => {
  test("accepts lowercase words joined by single hyphens", () => {
    for (const slug of ["katzen", "trinkbrunnen-mit-filter", "gadget-2"]) {
      expect(SlugSchema.safeParse(slug).success).toBe(true);
    }
  });

  test("rejects everything else", () => {
    for (const slug of ["", "Katzen", "a b", "-a", "a-", "a--b", "ä"]) {
      expect(SlugSchema.safeParse(slug).success).toBe(false);
    }
  });
});

describe("AccentColorSchema", () => {
  test("accepts six-digit hex colors only", () => {
    expect(AccentColorSchema.safeParse("#b8a1ff").success).toBe(true);
    for (const color of ["b8a1ff", "#fff", "red", "#b8a1ffaa", "url(x)"]) {
      expect(AccentColorSchema.safeParse(color).success).toBe(false);
    }
  });
});
