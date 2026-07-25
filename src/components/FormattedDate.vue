<script setup lang="ts">
import { computed } from "vue";
import { useFormatDate } from "../composables/useFormatDate";

const props = defineProps<{
  value?: string | null;
}>();

const { formatDate } = useFormatDate();
const formatted = computed(() => formatDate(props.value));
</script>

<template>
  <div v-if="formatted" class="formatted-date text-body-2">
    <div class="font-weight-medium">{{ formatted.date }}</div>
    <div class="text-caption text-medium-emphasis">{{ formatted.time }}</div>
  </div>
  <span v-else class="text-medium-emphasis">—</span>
</template>

<style scoped>
.formatted-date {
  line-height: 1.4;
  white-space: nowrap;
}
</style>
