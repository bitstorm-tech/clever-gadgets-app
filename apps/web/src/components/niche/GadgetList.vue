<script setup lang="ts">
import type { GadgetSummary } from "@clever-gadgets/shared";
import GadgetTeaser from "./GadgetTeaser.vue";

defineProps<{ nicheSlug: string; emoji: string; gadgets: GadgetSummary[] }>();
</script>

<template>
  <section class="gadget-list container" aria-labelledby="gadget-list-title">
    <h2 id="gadget-list-title" class="gadget-list-title">All gadgets</h2>
    <ul v-if="gadgets.length > 0" class="gadget-grid">
      <li v-for="gadget in gadgets" :key="gadget.slug">
        <GadgetTeaser :niche-slug="nicheSlug" :emoji="emoji" :gadget="gadget" />
      </li>
    </ul>
    <p v-else class="gadget-list-empty">There are no gadgets here yet. Check back soon.</p>
  </section>
</template>

<style scoped>
.gadget-list {
  padding-top: clamp(2rem, 6vw, 3.5rem);
}

.gadget-list-title {
  margin-bottom: 1.5rem;
  font-size: 1.75rem;
}

.gadget-grid {
  display: grid;
  gap: 2.25rem 1.5rem;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 18rem), 1fr));
}

.gadget-list-empty {
  color: var(--ink-soft);
}
</style>
