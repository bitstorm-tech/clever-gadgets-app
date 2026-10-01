<script setup lang="ts">
import SiteFooter from "./components/layout/SiteFooter.vue";
import SiteHeader from "./components/layout/SiteHeader.vue";
</script>

<template>
  <a class="skip-link" href="#main">Skip to content</a>
  <SiteHeader />
  <main id="main" class="main">
    <RouterView />
  </main>
  <SiteFooter />
</template>

<style scoped>
.main {
  flex: 1;
}

.skip-link {
  position: absolute;
  top: -4rem;
  left: var(--gutter);
  z-index: 10;
  padding: 0.6rem 1rem;
  border-radius: 0.6rem;
  background: var(--ink);
  color: #fff;
  font-weight: 700;
  text-decoration: none;
}

.skip-link:focus {
  top: 0.75rem;
}
</style>
