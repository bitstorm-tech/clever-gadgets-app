<script setup lang="ts">
defineProps<{ href: string; merchantName: string }>();
const emit = defineEmits<{ activate: [] }>();

/** Die mittlere Maustaste öffnet den Link ebenfalls, löst aber kein `click` aus. */
function onAuxClick(event: MouseEvent) {
  if (event.button === 1) emit("activate");
}
</script>

<template>
  <!-- `sponsored` kennzeichnet den Link gegenüber Suchmaschinen als bezahlte Empfehlung. -->
  <a
    :href="href"
    class="affiliate-button"
    target="_blank"
    rel="sponsored nofollow noopener"
    @click="emit('activate')"
    @auxclick="onAuxClick"
  >
    Zum Angebot bei {{ merchantName }}
    <span class="visually-hidden">(öffnet in einem neuen Tab)</span>
  </a>
</template>

<style scoped>
/* Der Knopf hat eine feste Unterkante und senkt sich beim Drücken: ein Gadget zum Antippen. */
.affiliate-button {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 3.75rem;
  padding: 0.75rem 1.5rem;
  border: 3px solid var(--ink);
  border-radius: 1.25rem;
  background: var(--volt);
  box-shadow: 0 6px 0 var(--ink);
  color: var(--ink);
  font-size: 1.25rem;
  font-weight: 800;
  letter-spacing: -0.01em;
  line-height: 1.15;
  text-align: center;
  text-decoration: none;
  text-wrap: balance;
  transition:
    transform 80ms ease-out,
    box-shadow 80ms ease-out;
}

@media (hover: hover) {
  .affiliate-button:hover {
    box-shadow: 0 8px 0 var(--ink);
    transform: translateY(-2px);
  }
}

.affiliate-button:active {
  box-shadow: 0 1px 0 var(--ink);
  transform: translateY(5px);
}

@media (min-width: 40rem) {
  .affiliate-button {
    display: inline-flex;
    justify-self: start;
    padding-inline: 2.25rem;
  }
}
</style>
