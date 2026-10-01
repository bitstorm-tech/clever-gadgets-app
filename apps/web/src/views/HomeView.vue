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
    <h2 id="niches-title" class="niches-title">Wofür suchst du Gadgets?</h2>
    <ResourceBoundary :status="status" inline @retry="reload">
      <ul v-if="niches && niches.length > 0" class="niche-grid">
        <li v-for="niche in niches" :key="niche.slug">
          <NicheTile :niche="niche" />
        </li>
      </ul>
      <p v-else class="niches-empty">Hier ist noch nichts. Schau bald wieder vorbei.</p>
    </ResourceBoundary>
  </section>
</template>

<style scoped>
.niches-title {
  margin-bottom: 1.25rem;
  font-size: 1.5rem;
}

/* auto-fit: Eine einzelne Nische füllt die ganze Breite, mehrere teilen sie sich. */
.niche-grid {
  display: grid;
  gap: 1.25rem;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 20rem), 1fr));
}

/* Die Kachel passt ihr Layout an die Breite ihres Platzes an (siehe NicheTile). */
.niche-grid > li {
  container: niche-slot / inline-size;
}

.niches-empty {
  color: var(--ink-soft);
}
</style>
