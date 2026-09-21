<template>
  <div v-if="alarmStore.isOpen && alarmStore.activeAlarm" class="alarm-overlay">
    <div class="alarm-card fade-in">
      <div class="alarm-icon-wrapper">
        <i class="bi bi-bell-fill alarm-bell-pulse"></i>
      </div>

      <div class="alarm-content text-center">
        <span class="badge bg-danger text-uppercase px-3 py-1 mb-2">
          <i class="bi bi-alarm me-1"></i>
          {{ alarmStore.activeAlarm.isSnoozed ? 'Snoozed Alarm' : 'Task Reminder' }}
        </span>

        <h3 class="alarm-title">{{ alarmStore.activeAlarm.task?.title }}</h3>

        <p v-if="alarmStore.activeAlarm.task?.description" class="alarm-desc text-muted mb-2">
          {{ alarmStore.activeAlarm.task.description }}
        </p>

        <div class="alarm-meta d-flex justify-content-center align-items-center gap-3 text-muted small my-3">
          <span v-if="alarmStore.activeAlarm.task?.start_time">
            <i class="bi bi-clock me-1"></i>{{ alarmStore.activeAlarm.task.start_time }}
          </span>
          <span v-if="alarmStore.activeAlarm.task?.category">
            <span
              class="category-dot me-1"
              :style="{ backgroundColor: alarmStore.activeAlarm.task.category.color }"
            ></span>
            {{ alarmStore.activeAlarm.task.category.name }}
          </span>
        </div>
      </div>

      <!-- Action Controls -->
      <div class="alarm-actions d-grid gap-2 mt-4">
        <button class="btn btn-danger btn-lg fw-bold shadow-sm" @click="handleDismiss">
          <i class="bi bi-stop-circle me-1"></i> Stop Alarm
        </button>

        <div class="d-flex gap-2">
          <button class="btn btn-outline-secondary flex-fill" @click="handleSnooze(5)">
            <i class="bi bi-clock-history me-1"></i> Snooze 5m
          </button>
          <button class="btn btn-outline-secondary flex-fill" @click="handleSnooze(10)">
            <i class="bi bi-clock-history me-1"></i> Snooze 10m
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useSchedulerAlarmStore } from '../../stores/schedulerAlarm';

const alarmStore = useSchedulerAlarmStore();

function handleDismiss() {
  alarmStore.dismiss();
}

function handleSnooze(minutes) {
  alarmStore.snooze(minutes);
}
</script>

<style scoped>
.alarm-overlay {
  position: fixed;
  inset: 0;
  z-index: 1060;
  background: rgba(15, 23, 42, 0.82);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.alarm-card {
  width: 100%;
  max-width: 420px;
  background: var(--card-bg, #ffffff);
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 1.5rem;
  padding: 2rem 1.5rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35);
  animation: bounceIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.alarm-icon-wrapper {
  width: 72px;
  height: 72px;
  margin: 0 auto 1.25rem;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.2rem;
}

.alarm-bell-pulse {
  animation: bellRing 1s infinite alternate ease-in-out;
}

.alarm-title {
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--text-primary, #1e293b);
  margin-bottom: 0.5rem;
}

.alarm-desc {
  font-size: 0.9rem;
  line-height: 1.4;
}

.category-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

@keyframes bellRing {
  0% {
    transform: rotate(-18deg) scale(1);
  }
  100% {
    transform: rotate(18deg) scale(1.1);
  }
}

@keyframes bounceIn {
  0% {
    opacity: 0;
    transform: scale(0.85);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
