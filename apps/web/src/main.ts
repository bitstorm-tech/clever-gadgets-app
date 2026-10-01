import "@fontsource-variable/bricolage-grotesque/opsz.css";
import { createApp } from "vue";
import App from "./App.vue";
import { captureAttribution } from "./attribution";
import { router } from "./router";
import "./styles.css";

// Muss vor dem ersten Rendern passieren: Danach kann die Router-Navigation die Adresse verändern.
captureAttribution(window.location.search);

createApp(App).use(router).mount("#app");
