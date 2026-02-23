import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";

// i18n
import i18n from "./i18n";

// Vuetify
import "vuetify/styles";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import "@mdi/font/css/materialdesignicons.css";

// Locales
import { ar, en } from "vuetify/locale";

const vuetify = createVuetify({
  components,
  directives,
  locale: {
    locale: "ar",
    fallback: "ar",
    messages: { ar, en },
  },
  theme: {
    defaultTheme: "light",
    themes: {
      light: {
        colors: {
          primary: "#FF6B35", // برتقالي
          secondary: "#D62828", // أحمر
          accent: "#F7931E", // برتقالي فاتح
          background: "#FFFFFF",
          surface: "#F5F5F5",
          error: "#B00020",
          info: "#2196F3",
          success: "#4CAF50",
          warning: "#FB8C00",
          "on-primary": "#FFFFFF",
          "on-secondary": "#FFFFFF",
          "on-surface": "#000000",
        },
      },
    },
  },
});

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.use(i18n);
app.use(vuetify);

app.mount("#app");
