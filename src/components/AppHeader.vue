<script setup lang="ts">
const props = defineProps<{
  title?: string;
  subtitle?: string;
}>();
</script>

<template>
  <!-- Header -->
  <v-row class="mb-6">
    <v-col cols="12">
      <v-card class="custom-card header-card" elevation="8">
        <v-card-text class="pa-6">
          <div class="d-flex align-center justify-space-between">
            <div>
              <h1 class="gradient-text text-h3 font-weight-bold mb-2">
                {{ props?.title }}
              </h1>
              <p class="text-h6 text-grey-darken-1">
                {{ props?.subtitle }}
              </p>
            </div>
            <div class="lightning-icons">
              <v-icon color="warning" class="lightning-icon mx-1"
                >mdi-lightning-bolt</v-icon
              >
              <v-icon color="error" class="lightning-icon mx-1"
                >mdi-lightning-bolt</v-icon
              >
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>
