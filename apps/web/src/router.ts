import { createRouter, createWebHistory } from "vue-router";

declare module "vue-router" {
  interface RouteMeta {
    /** Überschrift und Seitentitel der Textseiten (Impressum, Datenschutz). */
    title?: string;
  }
}

export const router = createRouter({
  history: createWebHistory(),
  // Neue Seiten starten oben; "Zurück" stellt die alte Position wieder her.
  scrollBehavior: (_to, _from, savedPosition) => savedPosition ?? { top: 0 },
  routes: [
    { path: "/", name: "home", component: () => import("./views/HomeView.vue") },
    {
      path: "/impressum",
      name: "imprint",
      component: () => import("./views/LegalView.vue"),
      meta: { title: "Impressum" },
    },
    {
      path: "/datenschutz",
      name: "privacy",
      component: () => import("./views/LegalView.vue"),
      meta: { title: "Datenschutz" },
    },
    // Statische Pfade stehen vor den dynamischen: /impressum ist keine Nische.
    { path: "/:nicheSlug", name: "niche", component: () => import("./views/NicheView.vue"), props: true },
    {
      path: "/:nicheSlug/:gadgetSlug",
      name: "gadget",
      component: () => import("./views/GadgetView.vue"),
      props: true,
    },
    { path: "/:pathMatch(.*)*", name: "not-found", component: () => import("./views/NotFoundView.vue") },
  ],
});
