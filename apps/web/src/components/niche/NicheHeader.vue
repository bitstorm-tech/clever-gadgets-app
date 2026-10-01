<script setup lang="ts">
import type { Niche } from "@clever-gadgets/shared";
import { computed } from "vue";
import Breadcrumbs from "../common/Breadcrumbs.vue";

const props = defineProps<{ niche: Niche }>();

const crumbs = computed(() => [{ label: "Home", to: "/" }, { label: props.niche.name }]);
</script>

<template>
  <header class="niche-header">
    <div class="container niche-header-inner">
      <Breadcrumbs :items="crumbs" />
      <div class="niche-top">
        <h1 class="niche-title">{{ niche.name }}</h1>
        <span class="niche-emoji" aria-hidden="true">{{ niche.emoji }}</span>
      </div>
      <p class="niche-tagline">{{ niche.tagline }}</p>
      <p class="niche-description">{{ niche.description }}</p>
    </div>
  </header>
</template>

<style scoped>
.niche-header {
  overflow: hidden;
  border-radius: 0 0 2rem 2rem;
  background: var(--niche);
}

.niche-header-inner {
  padding-bottom: clamp(2.5rem, 7vw, 4.5rem);
}

.niche-top {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1rem;
}

.niche-title {
  min-width: 0;
  font-size: clamp(3rem, 14vw, 6.5rem);
  line-height: 0.95;
  letter-spacing: -0.04em;
  overflow-wrap: anywhere;
}

.niche-emoji {
  flex: none;
  font-size: clamp(4rem, 18vw, 9rem);
  line-height: 1;
  transform: rotate(9deg);
}

.niche-tagline {
  max-width: 26ch;
  margin-top: 1rem;
  font-size: clamp(1.2rem, 3vw, 1.6rem);
  font-weight: 600;
  line-height: 1.2;
}

.niche-description {
  max-width: 34rem;
  margin-top: 1rem;
}
</style>
