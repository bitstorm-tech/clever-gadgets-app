import { watchEffect } from "vue";

const SITE_NAME = "Clever Gadgets";
const DEFAULT_DESCRIPTION = "Hand-picked everyday gadgets, each with its own page and a direct link to the seller.";

export interface PageMeta {
  title?: string;
  description?: string;
}

/** Sets the title and description of the page. Missing values fall back to the defaults of the site. */
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
