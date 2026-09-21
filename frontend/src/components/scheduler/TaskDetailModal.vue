<template>
  <div v-if="isOpen && task" class="modal-backdrop-custom" @click.self="$emit('close')">
    <div class="modal-dialog-custom">
      <div class="modal-content-custom">
        <!-- Header -->
        <div class="modal-header-custom d-flex justify-content-between align-items-center">
          <div class="d-flex align-items-center gap-2">
            <span class="badge" :class="priorityBadgeClass">
              {{ task.priority }}
            </span>
            <span v-if="task.status === 'completed'" class="badge bg-success-subtle text-success">
              <i class="bi bi-check-circle me-1"></i> Completed
            </span>
          </div>
          <button class="btn-close-custom" @click="$emit('close')">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <!-- Body -->
        <div class="modal-body-custom">
          <h4
            class="task-detail-title mb-2"
            :class="{ 'text-decoration-line-through text-muted': task.status === 'completed' }"
          >
            {{ task.title }}
          </h4>

          <p v-if="task.description" class="task-detail-desc text-muted mb-4 whitespace-pre-wrap">
            {{ task.description }}
          </p>

          <!-- Detail List -->
          <div class="list-group list-group-flush mb-4 rounded-3 border">
            <!-- Date & Time -->
            <div class="list-group-item d-flex align-items-center justify-content-between py-2.5">
              <span class="text-muted small"><i class="bi bi-calendar3 me-2"></i>Date & Time</span>
              <span class="fw-semibold small">
                {{ formattedDate }}
                <template v-if="task.is_all_day"> (All Day)</template>
                <template v-else-if="task.start_time"> at {{ task.start_time }}</template>
              </span>
            </div>

            <!-- Category -->
            <div v-if="task.category" class="list-group-item d-flex align-items-center justify-content-between py-2.5">
              <span class="text-muted small"><i class="bi bi-tag me-2"></i>Category</span>
              <span class="badge" :style="{ backgroundColor: task.category.color }">
                {{ task.category.name }}
              </span>
            </div>

            <!-- Assigned Member -->
            <div v-if="assignedMember" class="list-group-item d-flex align-items-center justify-content-between py-2.5">
              <span class="text-muted small"><i class="bi bi-person me-2"></i>Assigned To</span>
              <span class="badge bg-primary-subtle text-primary">
                {{ assignedMember.name }} ({{ assignedMember.role }})
              </span>
            </div>

            <!-- Reminders -->
            <div v-if="task.reminders && task.reminders.length > 0" class="list-group-item d-flex align-items-center justify-content-between py-2.5">
              <span class="text-muted small"><i class="bi bi-bell me-2"></i>Reminder</span>
              <span class="fw-semibold small text-warning">
                {{ formatReminderText(task.reminders[0]) }}
              </span>
            </div>

            <!-- Google Calendar Link -->
            <div v-if="task.external_provider === 'google' || task.external_event_link" class="list-group-item d-flex align-items-center justify-content-between py-2.5">
              <span class="text-muted small">
                <i class="bi bi-google me-2 text-primary"></i>Google Calendar
              </span>
              <a
                :href="task.external_event_link || 'https://calendar.google.com'"
                target="_blank"
                rel="noopener noreferrer"
                class="btn btn-sm btn-link p-0 text-decoration-none fw-semibold small d-flex align-items-center gap-1"
              >
                <span>Open in Google</span>
                <i class="bi bi-box-arrow-up-right" style="font-size: 0.75rem;"></i>
              </a>
            </div>
          </div>

          <!-- Bottom Action Buttons -->
          <div class="d-flex flex-column gap-2">
            <!-- Quick Export Tools -->
            <div class="d-flex gap-2">
              <a
                :href="googleWebUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="btn btn-outline-secondary btn-sm flex-fill d-flex align-items-center justify-content-center gap-1"
                title="Add to Google Calendar directly in browser"
              >
                <svg viewBox="0 0 24 24" width="13" height="13">
                  <path fill="#EA4335" d="M12 5c1.54 0 2.93.57 4.02 1.5l3.01-3.01C17.2 1.77 14.77 1 12 1 7.42 1 3.53 3.59 1.63 7.36l3.66 2.84C6.18 7.35 8.84 5 12 5z" />
                  <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58l3.71 2.88c2.16-2 3.71-4.94 3.71-8.7z" />
                  <path fill="#FBBC05" d="M5.29 14.8c-.24-.72-.38-1.49-.38-2.3s.14-1.58.38-2.3L1.63 7.36C.59 9.44 0 11.66 0 14s.59 4.56 1.63 6.64l3.66-2.84z" />
                  <path fill="#34A853" d="M12 23c3.24 0 5.95-1.08 7.93-2.91l-3.71-2.88c-1.07.72-2.45 1.16-4.22 1.16-3.16 0-5.82-2.35-6.71-5.2L1.63 15.99C3.53 19.41 7.42 23 12 23z" />
                </svg>
                <span>Add to Google Cal</span>
              </a>
              <button
                type="button"
                class="btn btn-outline-secondary btn-sm flex-fill d-flex align-items-center justify-content-center gap-1"
                @click="downloadIcs"
                title="Download .ics for Outlook, Apple Calendar, or Google Calendar"
              >
                <i class="bi bi-file-earmark-arrow-down text-primary"></i>
                <span>Download .ics</span>
              </button>
            </div>

            <!-- Toggle Complete Button -->
            <button
              class="btn btn-lg w-100 fw-bold"
              :class="task.status === 'completed' ? 'btn-outline-secondary' : 'btn-success'"
              @click="$emit('toggle-status', task)"
            >
              <i class="bi" :class="task.status === 'completed' ? 'bi-arrow-counterclockwise me-1' : 'bi-check2-circle me-1'"></i>
              {{ task.status === 'completed' ? 'Mark Incomplete' : 'Mark as Completed' }}
            </button>

            <div class="d-flex gap-2">
              <button class="btn btn-outline-primary flex-fill" @click="$emit('edit', task)">
                <i class="bi bi-pencil me-1"></i> Edit Task
              </button>
              <button class="btn btn-outline-danger flex-fill" @click="handleDelete">
                <i class="bi bi-trash me-1"></i> Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { format } from 'date-fns';
import { parseLocalDate } from '../../utils/schedulerDate';
import { googleCalendarService } from '../../services/scheduler/googleCalendarService';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  task: {
    type: Object,
    default: null,
  },
  members: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['close', 'edit', 'delete', 'toggle-status']);

const assignedMember = computed(() => {
  if (!props.task?.assigned_member_id || !props.members.length) return null;
  return props.members.find((m) => String(m.id) === String(props.task.assigned_member_id));
});

const formattedDate = computed(() => {
  if (!props.task?.task_date) return '';
  return format(parseLocalDate(props.task.task_date), 'EEEE, d MMMM yyyy');
});

const priorityBadgeClass = computed(() => {
  switch (props.task?.priority) {
    case 'urgent':
      return 'bg-danger';
    case 'high':
      return 'bg-warning text-dark';
    case 'medium':
      return 'bg-primary';
    case 'low':
    default:
      return 'bg-secondary';
  }
});

function formatReminderText(reminder) {
  if (!reminder) return '';
  const mins = reminder.minutes_before;
  if (mins === 0) return 'At time of event';
  if (mins < 60) return `${mins} minutes before`;
  if (mins === 60) return '1 hour before';
  if (mins === 1440) return '1 day before';
  return `${mins}m before`;
}

const googleWebUrl = computed(() => {
  if (!props.task) return '#';
  return googleCalendarService.generateWebExportUrl(props.task);
});

function downloadIcs() {
  if (props.task) {
    googleCalendarService.downloadIcsFile(props.task);
  }
}

function handleDelete() {
  if (confirm(`Are you sure you want to delete "${props.task?.title}"?`)) {
    emit('delete', props.task.id);
  }
}
</script>

<style scoped>
.modal-backdrop-custom {
  position: fixed;
  inset: 0;
  z-index: 1050;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal-dialog-custom {
  width: 100%;
  max-width: 480px;
}

.modal-content-custom {
  background: var(--card-bg, #ffffff);
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 1.25rem;
  overflow: hidden;
  box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.3);
}

.modal-header-custom {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border-color, #e2e8f0);
}

.btn-close-custom {
  background: transparent;
  border: none;
  font-size: 1.1rem;
  color: var(--text-muted, #94a3b8);
  cursor: pointer;
  padding: 0.25rem;
}

.modal-body-custom {
  padding: 1.5rem;
}

.task-detail-title {
  font-weight: 700;
  color: var(--text-primary, #1e293b);
  line-height: 1.3;
}

.task-detail-desc {
  font-size: 0.92rem;
  line-height: 1.5;
  white-space: pre-line;
}
</style>
