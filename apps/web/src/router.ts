import { createRouter, createWebHistory } from "vue-router";

declare module "vue-router" {
  interface RouteMeta {
    /** Heading and page title of the text pages (legal notice, privacy policy). */
    title?: string;
  }
}

export const router = createRouter({
  history: createWebHistory(),
  // New pages start at the top; "Back" restores the previous position.
  scrollBehavior: (_to, _from, savedPosition) => savedPosition ?? { top: 0 },
  routes: [
    { path: "/", name: "home", component: () => import("./views/HomeView.vue") },
    {
      path: "/legal-notice",
      name: "legal-notice",
      component: () => import("./views/LegalView.vue"),
      meta: { title: "Legal Notice" },
    },
    {
      path: "/privacy-policy",
      name: "privacy-policy",
      component: () => import("./views/LegalView.vue"),
      meta: { title: "Privacy Policy" },
    },
    // Static paths come before dynamic ones: /legal-notice is not a niche.
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
