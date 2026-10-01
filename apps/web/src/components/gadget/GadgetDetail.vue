<script setup lang="ts">
import type { Gadget } from "@clever-gadgets/shared";
import { computed } from "vue";
import { trackGadgetClick } from "../../api/clicks";
import Breadcrumbs from "../common/Breadcrumbs.vue";
import ProductTile from "../common/ProductTile.vue";
import AffiliateButton from "./AffiliateButton.vue";
import AffiliateNotice from "./AffiliateNotice.vue";

const props = defineProps<{ gadget: Gadget }>();

const nicheLocation = computed(() => ({ name: "niche", params: { nicheSlug: props.gadget.niche.slug } }));
const crumbs = computed(() => [
  { label: "Start", to: "/" },
  { label: props.gadget.niche.name, to: nicheLocation.value },
  { label: props.gadget.name },
]);
const paragraphs = computed(() =>
  props.gadget.description
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean),
);
const pageStyle = computed(() => ({ "--niche": props.gadget.niche.accentColor }));

function onAffiliateClick() {
  trackGadgetClick(props.gadget.niche.slug, props.gadget.slug);
}
</script>

<template>
  <article class="gadget container" :style="pageStyle">
    <Breadcrumbs :items="crumbs" />

    <div class="hero">
      <ProductTile :image-url="gadget.imageUrl" :emoji="gadget.niche.emoji" :name="gadget.name" priority />
      <div class="hero-text">
        <h1 class="hero-title">{{ gadget.name }}</h1>
        <p class="hero-tagline">{{ gadget.tagline }}</p>
        <AffiliateButton
          class="hero-button"
          :href="gadget.affiliateUrl"
          :merchant-name="gadget.merchantName"
          @activate="onAffiliateClick"
        />
        <AffiliateNotice />
      </div>
    </div>

    <div class="body">
      <section v-if="gadget.highlights.length > 0" aria-labelledby="highlights-title">
        <h2 id="highlights-title" class="section-title">Darum ist es clever</h2>
        <ul class="highlights">
          <li v-for="(highlight, index) in gadget.highlights" :key="index" class="highlight">{{ highlight }}</li>
        </ul>
      </section>

      <section v-if="paragraphs.length > 0" aria-labelledby="story-title">
        <h2 id="story-title" class="section-title">Kurz erklärt</h2>
        <p v-for="(paragraph, index) in paragraphs" :key="index" class="story-paragraph">{{ paragraph }}</p>
      </section>

      <div class="closing">
        <AffiliateButton :href="gadget.affiliateUrl" :merchant-name="gadget.merchantName" @activate="onAffiliateClick" />
        <AffiliateNotice />
        <RouterLink :to="nicheLocation" class="back-link">Alle Gadgets für {{ gadget.niche.name }}</RouterLink>
      </div>
    </div>
  </article>
</template>

<style scoped>
.hero {
  display: grid;
  gap: 1.5rem;
}

/* Container: Die Überschrift richtet sich nach der Breite der Textspalte, nicht nach dem Fenster.
   So passen auch lange deutsche Wörter wie "Selbstreinigende" in die Spalte. */
.hero-text {
  container-type: inline-size;
  display: grid;
  align-content: center;
}

.hero-title {
  font-size: clamp(2rem, 11cqi, 4rem);
  line-height: 1;
}

.hero-tagline {
  margin-top: 0.75rem;
  font-size: clamp(1.15rem, 3vw, 1.4rem);
  line-height: 1.3;
  color: var(--ink-soft);
}

.hero-button {
  margin-top: 1.75rem;
}

@media (min-width: 46rem) {
  .hero {
    grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
    gap: 2rem;
    align-items: center;
  }

  .hero-text {
    justify-items: start;
  }
}

@media (min-width: 64rem) {
  .hero {
    gap: 3.5rem;
  }
}

.body {
  display: grid;
  gap: 2.75rem;
  max-width: 40rem;
  margin-top: clamp(2.5rem, 6vw, 3.5rem);
}

.section-title {
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

.highlights {
  display: grid;
  gap: 0.75rem;
}

.highlight {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.75rem;
  align-items: start;
  font-size: 1.1rem;
  font-weight: 600;
}

.highlight::before {
  content: "";
  width: 1.5rem;
  height: 1.5rem;
  margin-top: 0.1rem;
  border: 2px solid var(--ink);
  border-radius: 50%;
  background: var(--volt)
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M3.5 8.5l3 3 6-7' fill='none' stroke='%231b1f3b' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")
    center / 70% no-repeat;
}

.story-paragraph {
  font-size: 1.125rem;
  line-height: 1.6;
}

.story-paragraph + .story-paragraph {
  margin-top: 1rem;
}

.closing {
  display: grid;
}

.back-link {
  justify-self: start;
  margin-top: 2.25rem;
  font-weight: 700;
  text-underline-offset: 0.2em;
}
</style>
