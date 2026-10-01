<script setup lang="ts">
import type { RouteLocationRaw } from "vue-router";

/** The last item is the current page and has no `to`. */
defineProps<{ items: { label: string; to?: RouteLocationRaw }[] }>();
</script>

<template>
  <nav aria-label="Breadcrumb">
    <ol class="crumbs">
      <li v-for="(item, index) in items" :key="index" class="crumb">
        <RouterLink v-if="item.to" :to="item.to" class="crumb-link">{{ item.label }}</RouterLink>
        <span v-else class="crumb-current" aria-current="page">{{ item.label }}</span>
      </li>
    </ol>
  </nav>
</template>

<style scoped>
.crumbs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 0.5rem;
  padding-block: 1rem;
  font-size: 0.95rem;
  font-weight: 600;
}

/* The slash is purely decorative; the empty alternative text hides it from screen readers. */
.crumb + .crumb::before {
  content: "/" / "";
  margin-right: 0.5rem;
  opacity: 0.5;
}

.crumb-link {
  text-decoration: none;
}

.crumb-link:hover {
  text-decoration: underline;
}

.crumb-current {
  opacity: 0.75;
}
</style>
