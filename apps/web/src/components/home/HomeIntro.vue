<template>
  <section class="intro container">
    <h1 class="intro-title">Gadgets, auf die man erst mal kommen muss.</h1>
    <p class="intro-lead">
      Ausgewählte Helfer für den Alltag. Zu jedem Gadget gibt es eine eigene Seite und den direkten Weg zum Anbieter.
    </p>
  </section>
</template>

<style scoped>
.intro {
  padding-block: clamp(2.5rem, 9vw, 6rem) clamp(2rem, 5vw, 3.5rem);
}

.intro-title {
  max-width: 14ch;
  font-size: clamp(2.75rem, 11vw, 6rem);
  line-height: 0.98;
  letter-spacing: -0.02em;
}

.intro-lead {
  max-width: 34rem;
  margin-top: 1.25rem;
  font-size: clamp(1.1rem, 2.5vw, 1.35rem);
  line-height: 1.45;
  color: var(--ink-soft);
}
</style>
