<template>
  <footer class="site-footer">
    <div class="container footer-inner">
      <p class="footer-note">
        Clever Gadgets features hand-picked gadgets and links to the sellers' websites. If you buy through our links,
        we may earn a commission at no extra cost to you.
      </p>
      <nav class="footer-links" aria-label="Legal">
        <RouterLink to="/legal-notice" class="footer-link">Legal Notice</RouterLink>
        <RouterLink to="/privacy-policy" class="footer-link">Privacy Policy</RouterLink>
      </nav>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  margin-top: clamp(3rem, 8vw, 6rem);
  padding-block: 2.5rem 3rem;
  background: var(--ink);
  color: #c9cbe0;
}

.footer-inner {
  display: grid;
  gap: 1.5rem;
}

.footer-note {
  max-width: 44rem;
  font-size: 0.95rem;
  line-height: 1.6;
}

.footer-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1.5rem;
}

.footer-link {
  color: #fff;
  font-weight: 600;
  text-underline-offset: 0.2em;
}

.footer-link:focus-visible {
  outline-color: var(--volt);
}
</style>
