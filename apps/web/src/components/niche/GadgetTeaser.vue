<script setup lang="ts">
import type { GadgetSummary } from "@clever-gadgets/shared";
import ProductTile from "../common/ProductTile.vue";

defineProps<{ nicheSlug: string; emoji: string; gadget: GadgetSummary }>();
</script>

<template>
  <RouterLink :to="{ name: 'gadget', params: { nicheSlug, gadgetSlug: gadget.slug } }" class="teaser">
    <ProductTile class="teaser-tile" :image-url="gadget.imageUrl" :emoji="emoji" :name="gadget.name" />
    <h3 class="teaser-name">{{ gadget.name }}</h3>
    <p class="teaser-tagline">{{ gadget.tagline }}</p>
  </RouterLink>
</template>

<style scoped>
.teaser {
  display: grid;
  gap: 0.25rem;
  text-decoration: none;
}

.teaser-tile {
  margin-bottom: 0.75rem;
  transition: transform 140ms ease-out;
}

@media (hover: hover) {
  .teaser:hover .teaser-tile {
    transform: translateY(-4px);
  }
}

.teaser-name {
  font-size: 1.5rem;
  letter-spacing: -0.02em;
}

.teaser-tagline {
  color: var(--ink-soft);
}
</style>
