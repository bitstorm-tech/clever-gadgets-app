<script setup lang="ts">
import { fetchNiches } from "../api/catalog";
import ResourceBoundary from "../components/common/ResourceBoundary.vue";
import HomeIntro from "../components/home/HomeIntro.vue";
import NicheTile from "../components/home/NicheTile.vue";
import { useApiResource } from "../composables/useApiResource";
import { usePageMeta } from "../composables/usePageMeta";

const { data: niches, status, reload } = useApiResource(fetchNiches);

usePageMeta();
</script>

<template>
  <HomeIntro />
  <section class="niches container" aria-labelledby="niches-title">
    <h2 id="niches-title" class="niches-title">What do you need gadgets for?</h2>
    <ResourceBoundary :status="status" inline @retry="reload">
      <ul v-if="niches && niches.length > 0" class="niche-grid">
        <li v-for="niche in niches" :key="niche.slug">
          <NicheTile :niche="niche" />
        </li>
      </ul>
      <p v-else class="niches-empty">Nothing here yet. Check back soon.</p>
    </ResourceBoundary>
  </section>
</template>

<style scoped>
.niches-title {
  margin-bottom: 1.25rem;
  font-size: 1.5rem;
}

/* auto-fit: a single niche fills the whole width, several niches share it. */
.niche-grid {
  display: grid;
  gap: 1.25rem;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 20rem), 1fr));
}

/* The tile adapts its layout to the width of its slot (see NicheTile). */
.niche-grid > li {
  container: niche-slot / inline-size;
}

.niches-empty {
  color: var(--ink-soft);
}
</style>
