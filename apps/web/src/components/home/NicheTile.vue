<script setup lang="ts">
import type { NicheSummary } from "@clever-gadgets/shared";
import { computed } from "vue";
import { gadgetCountLabel } from "../../utils/format";

const props = defineProps<{ niche: NicheSummary }>();

const tileStyle = computed(() => ({ "--niche": props.niche.accentColor }));
</script>

<template>
  <RouterLink :to="{ name: 'niche', params: { nicheSlug: niche.slug } }" class="niche-tile" :style="tileStyle">
    <span class="niche-emoji" aria-hidden="true">{{ niche.emoji }}</span>
    <h3 class="niche-name">{{ niche.name }}</h3>
    <p class="niche-tagline">{{ niche.tagline }}</p>
    <span class="niche-count">{{ gadgetCountLabel(niche.gadgetCount) }}</span>
  </RouterLink>
</template>

<style scoped>
.niche-tile {
  position: relative;
  display: grid;
  align-content: end;
  gap: 0.5rem;
  min-height: 16rem;
  padding: 1.5rem;
  overflow: hidden;
  border-radius: 1.75rem;
  background: var(--niche);
  color: var(--ink);
  text-decoration: none;
  transition: transform 140ms ease-out;
}

@media (hover: hover) {
  .niche-tile:hover {
    transform: translateY(-4px) rotate(-0.4deg);
  }
}

.niche-emoji {
  position: absolute;
  top: 0.75rem;
  right: 1.25rem;
  font-size: 6.5rem;
  line-height: 1;
  transform: rotate(9deg);
}

/* Steht die Kachel allein oder zu zweit, ist sie ein breites Banner: Das Emoji rückt in die Mitte der Fläche. */
@container niche-slot (min-width: 40rem) {
  .niche-tile {
    min-height: 18rem;
    padding: 2rem;
  }

  .niche-emoji {
    top: 50%;
    right: clamp(1.5rem, 5vw, 4rem);
    font-size: clamp(7rem, 14vw, 10rem);
    transform: translateY(-50%) rotate(9deg);
  }
}

.niche-name {
  font-size: clamp(2.25rem, 8vw, 3.25rem);
  letter-spacing: -0.03em;
}

.niche-tagline {
  max-width: 22ch;
  font-weight: 600;
  line-height: 1.25;
}

.niche-count {
  justify-self: start;
  margin-top: 0.5rem;
  padding: 0.25rem 0.8rem;
  border-radius: 999px;
  background: var(--ink);
  color: #fff;
  font-size: 0.9rem;
  font-weight: 700;
}
</style>
