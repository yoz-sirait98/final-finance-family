<template>
  <div class="week-view-wrapper">
    <!-- Week Strip Navigator -->
    <div class="week-strip-card p-2 mb-3">
      <div class="d-flex justify-content-between align-items-center mb-2 px-2">
        <button class="btn btn-sm btn-outline-secondary" @click="prevWeek">
          <i class="bi bi-chevron-left"></i>
        </button>
        <span class="fw-bold small">{{ weekRangeLabel }}</span>
        <button class="btn btn-sm btn-outline-secondary" @click="nextWeek">
          <i class="bi bi-chevron-right"></i>
        </button>
      </div>

      <!-- 7-Day Pills -->
      <div class="week-days-row">
        <div
          v-for="day in weekDays"
          :key="day.dateStr"
          class="day-pill"
          :class="{
            'is-selected': day.dateStr === selectedDate,
            'is-today': day.isToday,
          }"
          @click="selectDay(day.dateStr)"
        >
          <span class="day-name">{{ day.dayName }}</span>
          <span class="day-number">{{ day.dayNumber }}</span>
          <span v-if="day.taskCount > 0" class="task-dot-badge">
            {{ day.taskCount }}
          </span>
        </div>
      </div>
    </div>

    <!-- Task List for Selected Day -->
    <div class="selected-day-header d-flex justify-content-between align-items-center mb-3">
      <h6 class="mb-0 fw-bold">
        {{ selectedDayLabel }}
      </h6>
      <span class="text-muted small">
        {{ dayTasks.length }} {{ dayTasks.length === 1 ? 'task' : 'tasks' }}
      </span>
    </div>

    <div v-if="dayTasks.length === 0" class="empty-state-card text-center p-4">
      <i class="bi bi-calendar2-check fs-2 text-muted mb-2 d-block"></i>
      <p class="text-muted small mb-0">No tasks scheduled for this day.</p>
    </div>

    <div v-else class="task-list">
      <TaskCard
        v-for="task in dayTasks"
        :key="task.id"
        :task="task"
        :members="members"
        @click="$emit('select-task', task)"
        @toggle="$emit('toggle-task', task)"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { format, addWeeks, subWeeks } from 'date-fns';
import { getDaysOfWeek, formatDateKey, parseLocalDate, isToday as checkIsToday } from '../../utils/schedulerDate';
import TaskCard from './TaskCard.vue';

const props = defineProps({
  tasks: {
    type: Array,
    default: () => [],
  },
  selectedDate: {
    type: String,
    required: true,
  },
  members: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['select-task', 'toggle-task', 'update:selectedDate']);

const currentAnchorDate = ref(parseLocalDate(props.selectedDate));

const weekDays = computed(() => {
  const days = getDaysOfWeek(currentAnchorDate.value);
  return days.map((d) => {
    const dateStr = formatDateKey(d);
    const count = props.tasks.filter((t) => t.task_date === dateStr && !t.is_deleted).length;
    return {
      date: d,
      dateStr,
      dayName: format(d, 'EEE'),
      dayNumber: format(d, 'd'),
      isToday: checkIsToday(dateStr),
      taskCount: count,
    };
  });
});

const weekRangeLabel = computed(() => {
  const days = getDaysOfWeek(currentAnchorDate.value);
  const startStr = format(days[0], 'd MMM');
  const endStr = format(days[6], 'd MMM yyyy');
  return `${startStr} - ${endStr}`;
});

const selectedDayLabel = computed(() => {
  const d = parseLocalDate(props.selectedDate);
  return format(d, 'EEEE, d MMMM yyyy');
});

const dayTasks = computed(() => {
  return props.tasks
    .filter((t) => t.task_date === props.selectedDate && !t.is_deleted)
    .sort((a, b) => (a.start_time || '99:99').localeCompare(b.start_time || '99:99'));
});

function prevWeek() {
  currentAnchorDate.value = subWeeks(currentAnchorDate.value, 1);
}

function nextWeek() {
  currentAnchorDate.value = addWeeks(currentAnchorDate.value, 1);
}

function selectDay(dateStr) {
  emit('update:selectedDate', dateStr);
}
</script>

<style scoped>
.week-strip-card {
  background: var(--card-bg, #ffffff);
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 1.25rem;
}

.week-days-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.35rem;
}

.day-pill {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.6rem 0.2rem;
  border-radius: 0.9rem;
  border: 1px solid transparent;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.day-pill:hover {
  background: rgba(148, 163, 184, 0.1);
}

.day-pill.is-today {
  border-color: rgba(79, 70, 229, 0.3);
}

.day-pill.is-selected {
  background: var(--primary, #4f46e5);
  color: #ffffff !important;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
}

.day-name {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  opacity: 0.8;
  margin-bottom: 0.2rem;
}

.day-number {
  font-size: 1rem;
  font-weight: 700;
}

.task-dot-badge {
  font-size: 0.65rem;
  font-weight: 700;
  min-width: 16px;
  height: 16px;
  line-height: 16px;
  text-align: center;
  border-radius: 9999px;
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  margin-top: 0.25rem;
}

.day-pill.is-selected .task-dot-badge {
  background: #ffffff;
  color: var(--primary, #4f46e5);
}

.empty-state-card {
  background: var(--card-bg, #ffffff);
  border: 1px dashed var(--border-color, #cbd5e1);
  border-radius: 1rem;
}
</style>
