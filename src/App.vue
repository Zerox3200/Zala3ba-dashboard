<template>
  <LocaleProvider>
    <v-app>
      <router-view />
    </v-app>
  </LocaleProvider>
</template>

<script setup lang="ts">
import LocaleProvider from "./components/LocaleProvider.vue";
</script>

<style>
/* Global styles inspired by the game interface */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: "Roboto", sans-serif;
  background: linear-gradient(135deg, #ff6b35 0%, #d62828 100%);
  min-height: 100vh;
}

.v-application {
  background: linear-gradient(135deg, #ff6b35 0%, #d62828 100%) !important;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #ff6b35;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #d62828;
}

/* Custom button styles */
.custom-btn {
  border-radius: 25px !important;
  text-transform: none !important;
  font-weight: 600 !important;
  box-shadow: 0 4px 8px rgba(255, 107, 53, 0.3) !important;
  transition: all 0.3s ease !important;
}

.custom-btn:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 6px 12px rgba(255, 107, 53, 0.4) !important;
}

/* Card styles */
.custom-card {
  border-radius: 16px !important;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1) !important;
  transition: all 0.3s ease !important;
}

.custom-card:hover {
  transform: translateY(-4px) !important;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15) !important;
}

/* Lightning bolt animation */
@keyframes lightning {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.lightning-icon {
  animation: lightning 2s infinite;
}

/* Gradient text */
.gradient-text {
  background: linear-gradient(45deg, #ff6b35, #d62828);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: bold;
}
</style>
