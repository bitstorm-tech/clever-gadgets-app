<script setup lang="ts">
import ResourceBoundary from "../components/common/ResourceBoundary.vue";
import { usePageMeta } from "../composables/usePageMeta";

usePageMeta(() => ({ title: "Page not found" }));
</script>

<template>
  <ResourceBoundary status="not-found" />
</template>
