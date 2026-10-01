<script setup lang="ts">
import type { ResourceStatus } from "../../composables/useApiResource";

/**
 * Shows the content once it has loaded, and otherwise a fitting message for loading, error or not found.
 * Use `inline` for spots inside a page that already has its own heading.
 */
defineProps<{ status: ResourceStatus; inline?: boolean }>();
const emit = defineEmits<{ retry: [] }>();
</script>

<template>
  <slot v-if="status === 'ready'" />

  <div v-else-if="status === 'loading'" class="state container" aria-busy="true">
    <p class="state-loading" role="status">Loading…</p>
  </div>

  <div v-else-if="status === 'not-found'" class="state container">
    <component :is="inline ? 'p' : 'h1'" class="state-title">This page doesn't exist.</component>
    <p class="state-text">The link may be outdated, or the gadget is no longer available.</p>
    <RouterLink to="/" class="state-action">Back to the homepage</RouterLink>
  </div>

  <div v-else class="state container">
    <component :is="inline ? 'p' : 'h1'" class="state-title">Something went wrong.</component>
    <p class="state-text">We couldn't load this page. Check your connection and try again.</p>
    <button type="button" class="state-action" @click="emit('retry')">Try again</button>
  </div>
</template>

<style scoped>
.state {
  display: grid;
  justify-items: start;
  gap: 1rem;
  padding-block: clamp(2.5rem, 10vw, 6rem);
}

.state-title {
  margin: 0;
  font-size: clamp(2rem, 7vw, 3.5rem);
  font-weight: 800;
  line-height: 1.05;
  letter-spacing: -0.03em;
}

.state-text {
  max-width: 34rem;
  color: var(--ink-soft);
}

.state-action {
  padding: 0.7rem 1.25rem;
  border: 0;
  border-radius: 999px;
  background: var(--ink);
  color: #fff;
  font: inherit;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
}

/* Fade in only after a short delay, so that fast responses cause no flicker. */
.state-loading {
  color: var(--ink-soft);
  opacity: 0;
  animation: state-appear 200ms ease-out 300ms forwards;
}

@keyframes state-appear {
  to {
    opacity: 1;
  }
}
</style>
