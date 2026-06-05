<template>
  <router-view />
  <AppToast />
</template>

<script setup>
import AppToast from './components/AppToast.vue';
import { useAuthStore } from './stores/auth';
import { initializeRealtime } from './lib/realtime';
import { onMounted } from 'vue';

const authStore = useAuthStore();

onMounted(() => {
  authStore.initialize();
  initializeRealtime();
});
</script>
