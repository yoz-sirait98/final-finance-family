<template>
  <router-view />
  <AppToast />
</template>

<script setup>
import AppToast from './components/AppToast.vue';
import { useAuthStore } from './stores/auth';
import { useThemeStore } from './stores/theme';
import { initializeRealtime } from './lib/realtime';
import { onMounted } from 'vue';

const authStore = useAuthStore();
const themeStore = useThemeStore();

onMounted(() => {
  themeStore.initTheme();
  authStore.initialize();
  initializeRealtime();
});
</script>
