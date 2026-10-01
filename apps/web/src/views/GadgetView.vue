<script setup lang="ts">
import { fetchGadget } from "../api/catalog";
import ResourceBoundary from "../components/common/ResourceBoundary.vue";
import GadgetDetail from "../components/gadget/GadgetDetail.vue";
import { useApiResource } from "../composables/useApiResource";
import { usePageMeta } from "../composables/usePageMeta";

const props = defineProps<{ nicheSlug: string; gadgetSlug: string }>();

const { data, status, reload } = useApiResource(() => fetchGadget(props.nicheSlug, props.gadgetSlug));

usePageMeta(() =>
  data.value ? { title: `${data.value.name} (${data.value.niche.name})`, description: data.value.tagline } : {},
);
</script>

<template>
  <ResourceBoundary :status="status" @retry="reload">
    <GadgetDetail v-if="data" :gadget="data" />
  </ResourceBoundary>
</template>
