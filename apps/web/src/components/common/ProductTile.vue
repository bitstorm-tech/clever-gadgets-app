<script setup lang="ts">
/**
 * Product image in a 4:3 frame. Without an image, the emoji of the niche fills the frame on a pegboard
 * of dots, so that gadgets without a photo still look deliberately designed.
 */
defineProps<{
  imageUrl: string | null;
  emoji: string;
  name: string;
  /** Load the image right away, e.g. because it is visible when the page opens. */
  priority?: boolean;
}>();
</script>

<template>
  <div class="tile">
    <img
      v-if="imageUrl"
      class="tile-image"
      :src="imageUrl"
      :alt="name"
      :loading="priority ? 'eager' : 'lazy'"
      :fetchpriority="priority ? 'high' : 'auto'"
      decoding="async"
    />
    <span v-else class="tile-emoji" aria-hidden="true">{{ emoji }}</span>
  </div>
</template>

<style scoped>
.tile {
  display: grid;
  place-items: center;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  border-radius: 1.5rem;
  background-color: var(--niche);
  background-image: radial-gradient(rgb(27 31 59 / 0.14) 2px, transparent 2.5px);
  background-size: 24px 24px;
}

.tile-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.tile-emoji {
  font-size: clamp(4.5rem, 20vw, 8rem);
  line-height: 1;
  filter: drop-shadow(0 0.4rem 0 rgb(27 31 59 / 0.18));
  transform: rotate(-7deg);
}
</style>
