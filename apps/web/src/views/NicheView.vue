<script setup lang="ts">
import { computed } from "vue";
import { fetchNiche } from "../api/catalog";
import ResourceBoundary from "../components/common/ResourceBoundary.vue";
import GadgetList from "../components/niche/GadgetList.vue";
import NicheHeader from "../components/niche/NicheHeader.vue";
import { useApiResource } from "../composables/useApiResource";
import { usePageMeta } from "../composables/usePageMeta";

const props = defineProps<{ nicheSlug: string }>();

const { data, status, reload } = useApiResource(() => fetchNiche(props.nicheSlug));

const nicheStyle = computed(() => (data.value ? { "--niche": data.value.niche.accentColor } : undefined));

usePageMeta(() =>
  data.value ? { title: data.value.niche.name, description: data.value.niche.tagline } : {},
);
</script>

<template>
  <ResourceBoundary :status="status" @retry="reload">
    <div v-if="data" :style="nicheStyle">
      <NicheHeader :niche="data.niche" />
      <GadgetList :niche-slug="data.niche.slug" :emoji="data.niche.emoji" :gadgets="data.gadgets" />
    </div>
  </ResourceBoundary>
</template>
