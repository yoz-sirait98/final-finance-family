<template>
  <div
    class="task-card"
    :class="{ 'is-completed': task.status === 'completed', 'is-urgent': task.priority === 'urgent' }"
    @click="$emit('click', task)"
  >
    <!-- Left Checkbox -->
    <div class="checkbox-wrapper" @click.stop="$emit('toggle', task)">
      <div
        class="custom-check"
        :class="{ checked: task.status === 'completed' }"
        :title="task.status === 'completed' ? 'Mark incomplete' : 'Mark completed'"
      >
        <i v-if="task.status === 'completed'" class="bi bi-check-lg"></i>
      </div>
    </div>

    <!-- Center Content -->
    <div class="task-info flex-grow-1 min-w-0">
      <div class="d-flex align-items-center gap-2 flex-wrap mb-1">
        <span
          class="task-title"
          :class="{ 'text-decoration-line-through text-muted': task.status === 'completed' }"
        >
          {{ task.title }}
        </span>

        <!-- Priority Badge -->
        <span class="badge priority-badge" :class="priorityClass">
          {{ task.priority }}
        </span>
      </div>

      <p v-if="task.description" class="task-desc text-muted mb-2 text-truncate">
        {{ task.description }}
      </p>

      <!-- Metadata Badges -->
      <div class="task-meta d-flex align-items-center gap-2 flex-wrap">
        <!-- Time Badge -->
        <span class="meta-pill">
          <i class="bi bi-clock me-1"></i>
          <template v-if="task.is_all_day">All Day</template>
          <template v-else-if="task.start_time">
            {{ task.start_time }}{{ task.end_time ? ` - ${task.end_time}` : '' }}
          </template>
          <template v-else>Anytime</template>
        </span>

        <!-- Category Badge -->
        <span
          v-if="task.category"
          class="meta-pill category-pill"
          :style="{ borderColor: task.category.color, color: task.category.color }"
        >
          <span class="cat-dot" :style="{ backgroundColor: task.category.color }"></span>
          {{ task.category.name }}
        </span>

        <!-- Assigned Member Badge -->
        <span v-if="assignedMember" class="meta-pill member-pill">
          <i class="bi bi-person-fill me-1"></i>
          {{ assignedMember.name }} ({{ assignedMember.role }})
        </span>

        <!-- Reminder indicator -->
        <span v-if="task.reminders && task.reminders.length > 0" class="meta-pill text-warning" title="Has active reminder">
          <i class="bi bi-bell-fill"></i>
        </span>
      </div>
    </div>

    <!-- Right Chevron Action -->
    <div class="action-arrow text-muted ms-2">
      <i class="bi bi-chevron-right"></i>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  task: {
    type: Object,
    required: true,
  },
  members: {
    type: Array,
    default: () => [],
  },
});

defineEmits(['click', 'toggle']);

const assignedMember = computed(() => {
  if (!props.task.assigned_member_id || !props.members.length) return null;
  return props.members.find((m) => String(m.id) === String(props.task.assigned_member_id));
});

const priorityClass = computed(() => {
  switch (props.task.priority) {
    case 'urgent':
      return 'bg-danger text-white';
    case 'high':
      return 'bg-warning text-dark';
    case 'medium':
      return 'bg-primary text-white';
    case 'low':
    default:
      return 'bg-secondary text-white';
  }
});
</script>

<style scoped>
.task-card {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.9rem 1rem;
  background: var(--card-bg, #ffffff);
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 1rem;
  margin-bottom: 0.65rem;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.task-card:hover {
  transform: translateY(-2px);
  border-color: var(--primary, #4f46e5);
  box-shadow: 0 6px 16px -4px rgba(79, 70, 229, 0.15);
}

.task-card.is-completed {
  opacity: 0.68;
  background: rgba(241, 245, 249, 0.4);
}

.task-card.is-urgent {
  border-left: 4px solid #ef4444;
}

.checkbox-wrapper {
  padding: 0.25rem;
  cursor: pointer;
}

.custom-check {
  width: 22px;
  height: 22px;
  border: 2px solid var(--border-color, #94a3b8);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  background: transparent;
}

.custom-check.checked {
  background: #10b981;
  border-color: #10b981;
  color: #ffffff;
}

.custom-check:hover:not(.checked) {
  border-color: var(--primary, #4f46e5);
}

.task-title {
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--text-primary, #1e293b);
}

.task-desc {
  font-size: 0.8rem;
  line-height: 1.3;
}

.priority-badge {
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  font-weight: 600;
  padding: 0.25em 0.5em;
  border-radius: 6px;
}

.meta-pill {
  display: inline-flex;
  align-items: center;
  font-size: 0.75rem;
  color: var(--text-muted, #64748b);
  background: rgba(148, 163, 184, 0.1);
  padding: 0.2rem 0.55rem;
  border-radius: 9999px;
  font-weight: 500;
}

.category-pill {
  border: 1px solid currentColor;
  background: rgba(255, 255, 255, 0.05);
}

.cat-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-right: 4px;
}

.member-pill {
  background: rgba(59, 130, 246, 0.1);
  color: #2563eb;
}

.action-arrow {
  opacity: 0.4;
  transition: opacity 0.2s;
}

.task-card:hover .action-arrow {
  opacity: 1;
}
</style>
