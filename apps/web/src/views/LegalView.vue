<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { usePageMeta } from "../composables/usePageMeta";

const route = useRoute();
const title = computed(() => route.meta.title ?? "");

usePageMeta(() => ({ title: title.value }));
</script>

<template>
  <article class="legal container">
    <h1 class="legal-title">{{ title }}</h1>
    <p class="legal-text">Dieser Text fehlt noch. Er muss vor dem Livegang vom Betreiber der Seite ergänzt werden.</p>
  </article>
</template>

<style scoped>
.legal {
  padding-block: clamp(2.5rem, 8vw, 5rem);
}

.legal-title {
  font-size: clamp(2.25rem, 8vw, 4rem);
}

.legal-text {
  max-width: 34rem;
  margin-top: 1rem;
  color: var(--ink-soft);
}
</style>
