<script setup lang="ts">
import type { ResourceStatus } from "../../composables/useApiResource";

/**
 * Zeigt den Inhalt, sobald er geladen ist, und sonst eine passende Meldung zum Laden, Fehler oder Nicht-Finden.
 * `inline` für Stellen innerhalb einer Seite, die schon eine eigene Überschrift hat.
 */
defineProps<{ status: ResourceStatus; inline?: boolean }>();
const emit = defineEmits<{ retry: [] }>();
</script>

<template>
  <slot v-if="status === 'ready'" />

  <div v-else-if="status === 'loading'" class="state container" aria-busy="true">
    <p class="state-loading" role="status">Lädt …</p>
  </div>

  <div v-else-if="status === 'not-found'" class="state container">
    <component :is="inline ? 'p' : 'h1'" class="state-title">Diese Seite gibt es nicht.</component>
    <p class="state-text">Vielleicht ist der Link veraltet oder das Gadget ist nicht mehr im Angebot.</p>
    <RouterLink to="/" class="state-action">Zur Startseite</RouterLink>
  </div>

  <div v-else class="state container">
    <component :is="inline ? 'p' : 'h1'" class="state-title">Das hat nicht geklappt.</component>
    <p class="state-text">Wir konnten die Seite nicht laden. Prüfe deine Verbindung und versuch es noch mal.</p>
    <button type="button" class="state-action" @click="emit('retry')">Noch mal versuchen</button>
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

/* Erst nach kurzer Verzögerung einblenden, damit schnelle Antworten kein Flackern erzeugen. */
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
