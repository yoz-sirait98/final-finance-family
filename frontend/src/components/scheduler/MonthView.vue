<template>
  <div class="month-view-wrapper">
    <!-- Month Calendar Card -->
    <div class="month-card p-3 mb-3">
      <!-- Month Navigator -->
      <div class="d-flex justify-content-between align-items-center mb-3">
        <button class="btn btn-sm btn-outline-secondary" @click="prevMonth">
          <i class="bi bi-chevron-left"></i>
        </button>
        <h6 class="mb-0 fw-bold">{{ currentMonthLabel }}</h6>
        <button class="btn btn-sm btn-outline-secondary" @click="nextMonth">
          <i class="bi bi-chevron-right"></i>
        </button>
      </div>

      <!-- Day Header (Mon - Sun) -->
      <div class="grid-weekdays mb-2">
        <span v-for="w in ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']" :key="w" class="weekday-header">
          {{ w }}
        </span>
      </div>

      <!-- Calendar Days Grid -->
      <div class="grid-days">
        <div
          v-for="day in monthDaysGrid"
          :key="day.dateStr"
          class="month-day-cell"
          :class="{
            'not-current-month': !day.isCurrentMonth,
            'is-selected': day.dateStr === selectedDate,
            'is-today': day.isToday,
          }"
          @click="selectDay(day.dateStr)"
        >
          <span class="day-num">{{ day.dayNumber }}</span>

          <!-- Category Dots (up to 3) -->
          <div class="dots-row">
            <span
              v-for="(dot, idx) in day.categoryDots.slice(0, 3)"
              :key="idx"
              class="cat-dot"
              :style="{ backgroundColor: dot.color }"
            ></span>
            <span v-if="day.categoryDots.length > 3" class="more-dots">+</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Selected Day Task Feed -->
    <div class="selected-day-section">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <h6 class="fw-bold mb-0">{{ selectedDayLabel }}</h6>
        <span class="text-muted small">{{ dayTasks.length }} tasks</span>
      </div>

      <div v-if="dayTasks.length === 0" class="empty-state p-4 text-center">
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
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { format, isSameMonth, addMonths, subMonths } from 'date-fns';
import { getMonthDaysGrid, formatDateKey, parseLocalDate, isToday as checkIsToday } from '../../utils/schedulerDate';
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

const currentMonthDate = ref(parseLocalDate(props.selectedDate));

const currentMonthLabel = computed(() => {
  return format(currentMonthDate.value, 'MMMM yyyy');
});

const selectedDayLabel = computed(() => {
  return format(parseLocalDate(props.selectedDate), 'EEEE, d MMMM yyyy');
});

const monthDaysGrid = computed(() => {
  const days = getMonthDaysGrid(currentMonthDate.value);
  return days.map((d) => {
    const dateStr = formatDateKey(d);
    const dayTasks = props.tasks.filter((t) => t.task_date === dateStr && !t.is_deleted);

    const categoryDots = [];
    dayTasks.forEach((t) => {
      const color = t.category?.color || '#4f46e5';
      if (!categoryDots.some((c) => c.color === color)) {
        categoryDots.push({ color });
      }
    });

    return {
      date: d,
      dateStr,
      dayNumber: format(d, 'd'),
      isCurrentMonth: isSameMonth(d, currentMonthDate.value),
      isToday: checkIsToday(dateStr),
      categoryDots,
    };
  });
});

const dayTasks = computed(() => {
  return props.tasks
    .filter((t) => t.task_date === props.selectedDate && !t.is_deleted)
    .sort((a, b) => (a.start_time || '99:99').localeCompare(b.start_time || '99:99'));
});

function prevMonth() {
  currentMonthDate.value = subMonths(currentMonthDate.value, 1);
}

function nextMonth() {
  currentMonthDate.value = addMonths(currentMonthDate.value, 1);
}

function selectDay(dateStr) {
  emit('update:selectedDate', dateStr);
}
</script>

<style scoped>
.month-card {
  background: var(--card-bg, #ffffff);
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 1.25rem;
}

.grid-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
}

.weekday-header {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--text-muted, #94a3b8);
}

.grid-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.25rem;
}

.month-day-cell {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.15s;
  padding: 0.2rem;
}

.month-day-cell:hover {
  background: rgba(148, 163, 184, 0.1);
}

.month-day-cell.not-current-month {
  opacity: 0.3;
}

.month-day-cell.is-today {
  border: 1.5px solid rgba(79, 70, 229, 0.4);
}

.month-day-cell.is-selected {
  background: var(--primary, #4f46e5);
  color: #ffffff;
  box-shadow: 0 4px 10px rgba(79, 70, 229, 0.3);
}

.day-num {
  font-size: 0.88rem;
  font-weight: 600;
}

.dots-row {
  display: flex;
  gap: 2px;
  margin-top: 2px;
  height: 6px;
  align-items: center;
}

.cat-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
}

.more-dots {
  font-size: 0.6rem;
  line-height: 1;
}

.empty-state {
  background: var(--card-bg, #ffffff);
  border: 1px dashed var(--border-color, #cbd5e1);
  border-radius: 1rem;
}
</style>
