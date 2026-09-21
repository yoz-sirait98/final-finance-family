<template>
  <div
    v-if="shouldShowBanner"
    class="alert alert-primary alert-dismissible d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3 shadow-xs border-primary-subtle"
    role="alert"
  >
    <div class="d-flex align-items-center gap-2">
      <i class="bi bi-bell-fill fs-5 text-primary"></i>
      <div>
        <strong class="d-block">{{ $t('scheduler.enableRemindersTitle') || 'Enable Task Reminders & Alarms' }}</strong>
        <span class="small text-muted">
          {{ $t('scheduler.enableRemindersDesc') || 'Allow browser notifications so you never miss family events, chores, and scheduled tasks.' }}
        </span>
      </div>
    </div>

    <div class="d-flex align-items-center gap-2">
      <button
        type="button"
        class="btn btn-sm btn-outline-secondary"
        @click="dismissBanner"
      >
        Later
      </button>
      <button
        type="button"
        class="btn btn-sm btn-primary fw-bold"
        @click="enableNotifications"
      >
        Enable Notifications
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { reminderService } from '../../services/scheduler/reminderService';

const isDismissed = ref(localStorage.getItem('yjs_notif_banner_dismissed') === 'true');
const permission = ref(reminderService.getNotificationPermission());

const shouldShowBanner = computed(() => {
  return !isDismissed.value && permission.value === 'default';
});

async function enableNotifications() {
  const result = await reminderService.requestNotificationPermission();
  permission.value = result;
  if (result === 'granted') {
    reminderService.showNotification('🎉 Notifications Enabled', {
      body: 'Family scheduler reminders and alarms are now active!',
    });
  }
  isDismissed.value = true;
}

function dismissBanner() {
  isDismissed.value = true;
  localStorage.setItem('yjs_notif_banner_dismissed', 'true');
}
</script>
