<template>
  <div class="agenda-view-wrapper">
    <div v-if="groupedDays.length === 0" class="empty-state-card text-center p-5">
      <i class="bi bi-calendar-x fs-1 text-muted mb-2 d-block"></i>
      <h6 class="fw-bold text-muted">No upcoming tasks</h6>
      <p class="text-muted small mb-0">Use the "+ New Task" button to schedule activities and family chores.</p>
    </div>

    <div v-else class="agenda-groups">
      <div
        v-for="group in groupedDays"
        :key="group.dateStr"
        class="agenda-date-group mb-4"
      >
        <!-- Date Header -->
        <div class="d-flex align-items-center gap-2 mb-2">
          <span
            class="badge date-label-badge"
            :class="group.isToday ? 'bg-primary' : 'bg-secondary-subtle text-body'"
          >
            {{ group.headerLabel }}
          </span>
          <span class="text-muted small">
            {{ group.tasks.length }} {{ group.tasks.length === 1 ? 'task' : 'tasks' }}
          </span>
          <div class="flex-grow-1 border-bottom ms-2 opacity-25"></div>
        </div>

        <!-- Task List -->
        <div class="task-list">
          <TaskCard
            v-for="task in group.tasks"
            :key="task.id"
            :task="task"
            :members="members"
            @click="$emit('select-task', task)"
            @toggle="$emit('toggle-task', task)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { formatRelativeDate, isToday as checkIsToday, parseLocalDate } from '../../utils/schedulerDate';
import { format } from 'date-fns';
import TaskCard from './TaskCard.vue';

const props = defineProps({
  tasks: {
    type: Array,
    default: () => [],
  },
  members: {
    type: Array,
    default: () => [],
  },
});

defineEmits(['select-task', 'toggle-task']);

const groupedDays = computed(() => {
  const map = new Map();

  const sortedTasks = [...props.tasks]
    .filter((t) => !t.is_deleted)
    .sort((a, b) => {
      if (a.task_date !== b.task_date) {
        return a.task_date.localeCompare(b.task_date);
      }
      return (a.start_time || '99:99').localeCompare(b.start_time || '99:99');
    });

  for (const task of sortedTasks) {
    if (!map.has(task.task_date)) {
      map.set(task.task_date, []);
    }
    map.get(task.task_date).push(task);
  }

  const groups = [];
  for (const [dateStr, tasks] of map.entries()) {
    const isToday = checkIsToday(dateStr);
    const d = parseLocalDate(dateStr);
    const rel = formatRelativeDate(dateStr);
    const headerLabel = isToday ? `Today (${format(d, 'd MMM')})` : `${rel} - ${format(d, 'EEEE, d MMM')}`;

    groups.push({
      dateStr,
      isToday,
      headerLabel,
      tasks,
    });
  }

  return groups;
});
</script>

<style scoped>
.empty-state-card {
  background: var(--card-bg, #ffffff);
  border: 1px dashed var(--border-color, #cbd5e1);
  border-radius: 1.25rem;
}

.date-label-badge {
  font-size: 0.82rem;
  font-weight: 600;
  padding: 0.35rem 0.65rem;
  border-radius: 0.6rem;
}
</style>
