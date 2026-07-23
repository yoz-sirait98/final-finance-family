<template>
  <div v-if="isSupported" class="push-toggle-wrapper">
    <button
      class="toggle-btn position-relative"
      :class="{ 'text-primary': isSubscribed, 'text-muted': !isSubscribed }"
      @click="togglePush"
      :disabled="loading"
      :title="isSubscribed ? (isId ? 'Notifikasi PUSH Aktif' : 'PUSH Notifications Active') : (isId ? 'Aktifkan Notifikasi PUSH' : 'Enable PUSH Notifications')"
    >
      <i class="bi" :class="isSubscribed ? 'bi-bell-fill' : 'bi-bell-slash'"></i>
      <span
        v-if="isSubscribed"
        class="position-absolute top-0 start-100 translate-middle p-1 bg-success border border-light rounded-circle"
        style="width: 8px; height: 8px;"
      ></span>
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { pushNotificationService } from '../services/pushNotificationService';
import { useLocaleStore } from '../stores/locale';
import { useToastStore } from '../stores/toast';

const localeStore = useLocaleStore();
const toast = useToastStore();

const isSupported = ref(false);
const isSubscribed = ref(false);
const loading = ref(false);

const isId = computed(() => localeStore.currentLocale === 'id');

async function checkSubscriptionState() {
  isSupported.value = pushNotificationService.isSupported();
  if (!isSupported.value) return;

  const sub = await pushNotificationService.getSubscription();
  isSubscribed.value = !!sub;
}

async function togglePush() {
  if (loading.value) return;
  loading.value = true;

  try {
    if (isSubscribed.value) {
      await pushNotificationService.unsubscribeUser();
      isSubscribed.value = false;
      toast.info(isId.value ? 'Notifikasi PUSH dinonaktifkan.' : 'PUSH notifications disabled.');
    } else {
      await pushNotificationService.subscribeUser();
      isSubscribed.value = true;
      toast.success(isId.value ? 'Notifikasi PUSH berhasil diaktifkan!' : 'PUSH notifications enabled successfully!');
    }
  } catch (err) {
    console.error('[PushToggle] Error toggling push:', err);
    toast.error(err.message || (isId.value ? 'Gagal mengubah status notifikasi' : 'Failed to update push status'));
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  checkSubscriptionState();
});
</script>

<style scoped>
.push-toggle-wrapper {
  display: inline-flex;
  align-items: center;
}
</style>
