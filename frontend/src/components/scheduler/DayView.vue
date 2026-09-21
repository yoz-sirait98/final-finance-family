<template>
  <div class="day-view-wrapper">
    <!-- All Day Section -->
    <div v-if="allDayTasks.length > 0" class="all-day-banner p-3 mb-3">
      <div class="d-flex align-items-center gap-2 mb-2 text-primary fw-bold small text-uppercase">
        <i class="bi bi-sun"></i>
        <span>All-Day Tasks ({{ allDayTasks.length }})</span>
      </div>
      <div class="d-flex flex-column gap-2">
        <div
          v-for="task in allDayTasks"
          :key="task.id"
          class="all-day-item"
          @click="$emit('select-task', task)"
        >
          <div class="d-flex align-items-center gap-2">
            <span
              v-if="task.category"
              class="cat-indicator"
              :style="{ backgroundColor: task.category.color }"
            ></span>
            <span :class="{ 'text-decoration-line-through text-muted': task.status === 'completed' }">
              {{ task.title }}
            </span>
          </div>
          <span class="badge bg-secondary-subtle text-secondary small">ALL DAY</span>
        </div>
      </div>
    </div>

    <!-- 24-Hour Timeline -->
    <div class="timeline-container">
      <!-- Live NOW line -->
      <div
        v-if="isViewingToday && currentTimeTopPercent >= 0 && currentTimeTopPercent <= 100"
        class="now-indicator"
        :style="{ top: `${currentTimeTopPercent}%` }"
      >
        <span class="now-dot"></span>
        <span class="now-line"></span>
        <span class="now-badge">NOW</span>
      </div>

      <div
        v-for="slot in hourlySlots"
        :key="slot.hour"
        class="timeline-slot"
      >
        <div class="slot-time-label">
          {{ slot.timeString }}
        </div>

        <div class="slot-content" @click="handleSlotClick(slot.timeString)">
          <!-- Tasks in this slot -->
          <div
            v-for="task in slot.tasks"
            :key="task.id"
            class="slot-task-pill"
            :class="{ 'is-done': task.status === 'completed' }"
            @click.stop="$emit('select-task', task)"
          >
            <span
              v-if="task.category"
              class="cat-indicator me-1"
              :style="{ backgroundColor: task.category.color }"
            ></span>
            <span class="slot-task-title fw-semibold">{{ task.title }}</span>
            <span v-if="task.end_time" class="text-muted small ms-1">({{ task.start_time }} - {{ task.end_time }})</span>
          </div>

          <!-- Empty slot hint on hover -->
          <span v-if="slot.tasks.length === 0" class="slot-empty-hint">
            <i class="bi bi-plus-circle me-1"></i> Add event
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { isToday } from '../../utils/schedulerDate';

const props = defineProps({
  tasks: {
    type: Array,
    default: () => [],
  },
  selectedDate: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(['select-task', 'click-slot']);

const isViewingToday = computed(() => isToday(props.selectedDate));

const allDayTasks = computed(() => {
  return props.tasks.filter((t) => t.is_all_day);
});

const timedTasks = computed(() => {
  return props.tasks.filter((t) => !t.is_all_day);
});

const hourlySlots = computed(() => {
  const slots = [];
  for (let hour = 0; hour < 24; hour++) {
    const hourStr = String(hour).padStart(2, '0');
    const timeString = `${hourStr}:00`;

    const slotTasks = timedTasks.value.filter((task) => {
      if (!task.start_time) return false;
      const taskHour = parseInt(task.start_time.split(':')[0], 10);
      return taskHour === hour;
    });

    slots.push({
      hour,
      timeString,
      tasks: slotTasks,
    });
  }
  return slots;
});

// Live current time calculation
const currentTimeTopPercent = ref(0);
let timerId = null;

function updateNowPercent() {
  const now = new Date();
  const minutesSinceMidnight = now.getHours() * 60 + now.getMinutes();
  currentTimeTopPercent.value = (minutesSinceMidnight / 1440) * 100;
}

onMounted(() => {
  updateNowPercent();
  timerId = setInterval(updateNowPercent, 30000);
});

onUnmounted(() => {
  if (timerId) clearInterval(timerId);
});

function handleSlotClick(timeString) {
  emit('click-slot', timeString);
}
</script>

<style scoped>
.day-view-wrapper {
  position: relative;
}

.all-day-banner {
  background: var(--primary-subtle, rgba(79, 70, 229, 0.08));
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 1rem;
}

.all-day-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 0.85rem;
  background: var(--card-bg, #ffffff);
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 0.75rem;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.all-day-item:hover {
  border-color: var(--primary, #4f46e5);
}

.cat-indicator {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.timeline-container {
  position: relative;
  background: var(--card-bg, #ffffff);
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 1.25rem;
  overflow: hidden;
}

.now-indicator {
  position: absolute;
  left: 0;
  right: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  pointer-events: none;
}

.now-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #ef4444;
  margin-left: -5px;
  box-shadow: 0 0 0 2px #ffffff;
}

.now-line {
  flex: 1;
  height: 2px;
  background: #ef4444;
}

.now-badge {
  background: #ef4444;
  color: #ffffff;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.15rem 0.4rem;
  border-radius: 9999px;
  margin-right: 0.5rem;
}

.timeline-slot {
  display: flex;
  min-height: 52px;
  border-bottom: 1px solid var(--border-color, rgba(226, 232, 240, 0.6));
  transition: background 0.15s;
}

.timeline-slot:hover {
  background: rgba(148, 163, 184, 0.04);
}

.slot-time-label {
  width: 65px;
  padding: 0.5rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-muted, #94a3b8);
  border-right: 1px solid var(--border-color, rgba(226, 232, 240, 0.6));
  text-align: right;
  user-select: none;
}

.slot-content {
  flex: 1;
  padding: 0.35rem 0.6rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  cursor: pointer;
  position: relative;
}

.slot-empty-hint {
  display: none;
  font-size: 0.75rem;
  color: var(--text-muted, #94a3b8);
  align-items: center;
  padding: 0.25rem;
}

.slot-content:hover .slot-empty-hint {
  display: inline-flex;
}

.slot-task-pill {
  display: inline-flex;
  align-items: center;
  padding: 0.3rem 0.6rem;
  background: rgba(79, 70, 229, 0.1);
  border: 1px solid rgba(79, 70, 229, 0.2);
  border-radius: 0.6rem;
  font-size: 0.82rem;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--text-primary, #1e293b);
}

.slot-task-pill:hover {
  border-color: var(--primary, #4f46e5);
  background: rgba(79, 70, 229, 0.15);
}

.slot-task-pill.is-done {
  opacity: 0.6;
  text-decoration: line-through;
}

.slot-task-title {
  max-width: 250px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
