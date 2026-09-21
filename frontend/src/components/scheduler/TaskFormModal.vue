<template>
  <div v-if="isOpen" class="modal-backdrop-custom" @click.self="$emit('close')">
    <div class="modal-dialog-custom">
      <div class="modal-content-custom">
        <!-- Header -->
        <div class="modal-header-custom d-flex justify-content-between align-items-center">
          <h5 class="mb-0 fw-bold">
            <i class="bi" :class="isEdit ? 'bi-pencil-square' : 'bi-plus-circle-fill text-primary'"></i>
            {{ isEdit ? 'Edit Task' : 'New Family Task' }}
          </h5>
          <button class="btn-close-custom" @click="$emit('close')">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <!-- Body Form -->
        <form @submit.prevent="handleSubmit" class="modal-body-custom">
          <!-- Title -->
          <div class="mb-3">
            <label class="form-label small fw-bold">Task Title *</label>
            <input
              v-model="form.title"
              type="text"
              class="form-control"
              placeholder="e.g., Pay electricity bill, Buy milk, Soccer practice"
              required
              autofocus
            />
          </div>

          <!-- Description -->
          <div class="mb-3">
            <label class="form-label small fw-bold">Description (Optional)</label>
            <textarea
              v-model="form.description"
              class="form-control"
              rows="2"
              placeholder="Add details, notes, or checklist items..."
            ></textarea>
          </div>

          <!-- Date & All-Day Toggle -->
          <div class="row g-2 mb-3">
            <div class="col-7">
              <label class="form-label small fw-bold">Date *</label>
              <input
                v-model="form.task_date"
                type="date"
                class="form-control"
                required
              />
            </div>
            <div class="col-5 d-flex align-items-end pb-1">
              <div class="form-check form-switch">
                <input
                  v-model="form.is_all_day"
                  class="form-check-input"
                  type="checkbox"
                  id="allDaySwitch"
                />
                <label class="form-check-label small fw-semibold" for="allDaySwitch">
                  All Day
                </label>
              </div>
            </div>
          </div>

          <!-- Time Inputs (if not all day) -->
          <div v-if="!form.is_all_day" class="row g-2 mb-3">
            <div class="col-6">
              <label class="form-label small fw-bold">Start Time</label>
              <input
                v-model="form.start_time"
                type="time"
                class="form-control"
              />
            </div>
            <div class="col-6">
              <label class="form-label small fw-bold">End Time</label>
              <input
                v-model="form.end_time"
                type="time"
                class="form-control"
              />
            </div>
          </div>

          <!-- Category & Assigned Member -->
          <div class="row g-2 mb-3">
            <div class="col-6">
              <label class="form-label small fw-bold">Category</label>
              <select v-model="form.category_id" class="form-select">
                <option :value="null">No Category</option>
                <option
                  v-for="cat in categories"
                  :key="cat.id"
                  :value="cat.id"
                >
                  {{ cat.name }}
                </option>
              </select>
            </div>
            <div class="col-6">
              <label class="form-label small fw-bold">Assign Member</label>
              <select v-model="form.assigned_member_id" class="form-select">
                <option :value="null">Unassigned</option>
                <option
                  v-for="m in members"
                  :key="m.id"
                  :value="m.id"
                >
                  {{ m.name }} ({{ m.role }})
                </option>
              </select>
            </div>
          </div>

          <!-- Priority Selection -->
          <div class="mb-3">
            <label class="form-label small fw-bold mb-1">Priority</label>
            <div class="d-flex gap-2">
              <button
                v-for="p in ['low', 'medium', 'high', 'urgent']"
                :key="p"
                type="button"
                class="btn btn-sm flex-fill text-capitalize priority-btn"
                :class="form.priority === p ? getPriorityBtnClass(p) : 'btn-outline-secondary'"
                @click="form.priority = p"
              >
                {{ p }}
              </button>
            </div>
          </div>

          <!-- Reminders -->
          <div class="mb-3 p-3 reminder-card rounded-3">
            <div class="d-flex align-items-center justify-content-between mb-2">
              <span class="small fw-bold">
                <i class="bi bi-bell me-1 text-warning"></i> Reminder / Alarm
              </span>
              <div class="form-check form-switch mb-0">
                <input
                  v-model="hasReminder"
                  class="form-check-input"
                  type="checkbox"
                  id="reminderSwitch"
                />
              </div>
            </div>

            <div v-if="hasReminder" class="row g-2 mt-1">
              <div class="col-7">
                <select v-model="reminderMinutes" class="form-select form-select-sm">
                  <option :value="0">At time of event</option>
                  <option :value="5">5 minutes before</option>
                  <option :value="15">15 minutes before</option>
                  <option :value="30">30 minutes before</option>
                  <option :value="60">1 hour before</option>
                  <option :value="1440">1 day before</option>
                </select>
              </div>
              <div class="col-5">
                <select v-model="reminderType" class="form-select form-select-sm">
                  <option value="both">Chime + Alert</option>
                  <option value="alarm">Chime Only</option>
                  <option value="notification">Alert Only</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Google Calendar Sync Option -->
          <div v-if="googleStore.isConnected" class="mb-3 p-2.5 rounded-3 border d-flex align-items-center justify-content-between" style="background: rgba(66, 133, 244, 0.06);">
            <div class="d-flex align-items-center gap-2">
              <svg viewBox="0 0 24 24" width="16" height="16">
                <path fill="#EA4335" d="M12 5c1.54 0 2.93.57 4.02 1.5l3.01-3.01C17.2 1.77 14.77 1 12 1 7.42 1 3.53 3.59 1.63 7.36l3.66 2.84C6.18 7.35 8.84 5 12 5z" />
                <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58l3.71 2.88c2.16-2 3.71-4.94 3.71-8.7z" />
                <path fill="#FBBC05" d="M5.29 14.8c-.24-.72-.38-1.49-.38-2.3s.14-1.58.38-2.3L1.63 7.36C.59 9.44 0 11.66 0 14s.59 4.56 1.63 6.64l3.66-2.84z" />
                <path fill="#34A853" d="M12 23c3.24 0 5.95-1.08 7.93-2.91l-3.71-2.88c-1.07.72-2.45 1.16-4.22 1.16-3.16 0-5.82-2.35-6.71-5.2L1.63 15.99C3.53 19.41 7.42 23 12 23z" />
              </svg>
              <span class="small fw-semibold">Sync with Google Calendar</span>
            </div>
            <div class="form-check form-switch mb-0">
              <input
                v-model="syncWithGoogle"
                class="form-check-input"
                type="checkbox"
                id="syncGoogleSwitch"
              />
            </div>
          </div>

          <!-- Actions -->
          <div class="d-flex justify-content-end gap-2 mt-4">
            <button type="button" class="btn btn-outline-secondary" @click="$emit('close')">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary px-4 fw-bold" :disabled="isSubmitting">
              <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-1"></span>
              {{ isEdit ? 'Save Changes' : 'Create Task' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { getTodayDateString } from '../../utils/schedulerDate';
import { useGoogleCalendarStore } from '../../stores/googleCalendar';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  initialTask: {
    type: Object,
    default: null,
  },
  defaultDate: {
    type: String,
    default: () => getTodayDateString(),
  },
  defaultTime: {
    type: String,
    default: null,
  },
  categories: {
    type: Array,
    default: () => [],
  },
  members: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['close', 'submit']);

const googleStore = useGoogleCalendarStore();
const isEdit = computed(() => !!props.initialTask?.id);
const isSubmitting = ref(false);
const syncWithGoogle = ref(false);

const form = ref({
  title: '',
  description: '',
  task_date: getTodayDateString(),
  start_time: '',
  end_time: '',
  is_all_day: false,
  priority: 'medium',
  category_id: null,
  assigned_member_id: null,
});

const hasReminder = ref(false);
const reminderMinutes = ref(15);
const reminderType = ref('both');

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      if (props.initialTask) {
        form.value = {
          title: props.initialTask.title || '',
          description: props.initialTask.description || '',
          task_date: props.initialTask.task_date || props.defaultDate,
          start_time: props.initialTask.start_time || '',
          end_time: props.initialTask.end_time || '',
          is_all_day: !!props.initialTask.is_all_day,
          priority: props.initialTask.priority || 'medium',
          category_id: props.initialTask.category_id || null,
          assigned_member_id: props.initialTask.assigned_member_id || null,
        };

        syncWithGoogle.value = props.initialTask?.external_provider === 'google';
        const existingReminder = props.initialTask.reminders?.[0];
        if (existingReminder) {
          hasReminder.value = true;
          reminderMinutes.value = existingReminder.minutes_before ?? 15;
          reminderType.value = existingReminder.reminder_type || 'both';
        } else {
          hasReminder.value = false;
        }
      } else {
        form.value = {
          title: '',
          description: '',
          task_date: props.defaultDate || getTodayDateString(),
          start_time: props.defaultTime || '09:00',
          end_time: '',
          is_all_day: !props.defaultTime,
          priority: 'medium',
          category_id: null,
          assigned_member_id: null,
        };
        hasReminder.value = false;
        syncWithGoogle.value = googleStore.isConnected && googleStore.autoSyncEnabled;
      }
    }
  },
  { immediate: true }
);

function getPriorityBtnClass(priority) {
  switch (priority) {
    case 'urgent':
      return 'btn-danger';
    case 'high':
      return 'btn-warning text-dark';
    case 'medium':
      return 'btn-primary';
    case 'low':
      return 'btn-secondary';
    default:
      return 'btn-primary';
  }
}

function handleSubmit() {
  if (!form.value.title.trim()) return;

  const reminders = hasReminder.value
    ? [
        {
          minutes_before: reminderMinutes.value,
          reminder_type: reminderType.value,
        },
      ]
    : [];

  const payload = {
    ...form.value,
    reminders,
    external_provider: syncWithGoogle.value ? 'google' : null,
  };

  emit('submit', payload);
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
  max-width: 520px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.modal-content-custom {
  background: var(--card-bg, #ffffff);
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 1.25rem;
  overflow: hidden;
  box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
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

.btn-close-custom:hover {
  color: var(--text-primary, #1e293b);
}

.modal-body-custom {
  padding: 1.5rem;
  overflow-y: auto;
}

.priority-btn {
  font-weight: 600;
  border-radius: 0.5rem;
}

.reminder-card {
  background: rgba(148, 163, 184, 0.08);
  border: 1px solid var(--border-color, #e2e8f0);
}
</style>
