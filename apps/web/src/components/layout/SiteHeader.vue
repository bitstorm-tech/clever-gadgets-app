<script setup lang="ts">
import BrandMark from "./BrandMark.vue";
</script>

<template>
  <header class="site-header">
    <div class="container site-header-inner">
      <RouterLink to="/" class="brand" aria-label="Clever Gadgets, go to homepage">
        <BrandMark class="brand-mark" />
        <span class="brand-name">Clever Gadgets</span>
      </RouterLink>
    </div>
  </header>
</template>

<style scoped>
.site-header-inner {
  display: flex;
  align-items: center;
  min-height: 4rem;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  text-decoration: none;
}

.brand-mark {
  flex: none;
  width: 2rem;
  height: 2rem;
}

.brand-name {
  font-size: 1.25rem;
  font-weight: 800;
  letter-spacing: -0.02em;
}
</style>
