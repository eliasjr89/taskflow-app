import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "./global.css";
import i18n from "./i18n";
import { initTheme } from "./composables/useTheme";

const app = createApp(App);

initTheme();

app.use(router);
app.use(i18n);
app.mount("#app");
