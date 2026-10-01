import { watchEffect } from "vue";

const SITE_NAME = "Clever Gadgets";
const DEFAULT_DESCRIPTION = "Ausgewählte Gadgets für den Alltag, jedes mit eigener Seite und direktem Weg zum Anbieter.";

export interface PageMeta {
  title?: string;
  description?: string;
}

/** Setzt Titel und Beschreibung der Seite. Fehlende Angaben fallen auf die Standardwerte der Seite zurück. */
export function usePageMeta(meta: () => PageMeta = () => ({})): void {
  watchEffect(() => {
    const { title, description = DEFAULT_DESCRIPTION } = meta();
    document.title = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
    descriptionTag().content = description;
  });
}

function descriptionTag(): HTMLMetaElement {
  let tag = document.head.querySelector<HTMLMetaElement>('meta[name="description"]');
  if (!tag) {
    tag = document.createElement("meta");
    tag.name = "description";
    document.head.append(tag);
  }
  return tag;
}
