import "@fontsource-variable/bricolage-grotesque/opsz.css";
import { createApp } from "vue";
import App from "./App.vue";
import { captureAttribution } from "./attribution";
import { router } from "./router";
import "./styles.css";

// Must happen before the first render: after that, router navigation may change the URL.
captureAttribution(window.location.search);

createApp(App).use(router).mount("#app");
