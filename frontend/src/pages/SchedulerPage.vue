<template>
  <div class="scheduler-page fade-in">
    <!-- Page Header -->
    <div class="page-header d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
      <div>
        <h4 class="mb-1 fw-bold d-flex align-items-center gap-2">
          <i class="bi bi-calendar-check text-primary"></i>
          {{ $t('scheduler.title') || 'Family Scheduler & Chores' }}
        </h4>
        <p class="text-muted small mb-0">
          {{ $t('scheduler.subtitle') || 'Coordinate daily schedules, household chores, and reminders for your family' }}
        </p>
      </div>

      <div class="d-flex align-items-center gap-2 flex-wrap">
        <!-- Google Calendar Button -->
        <button
          class="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1.5"
          @click="isGoogleModalOpen = true"
          :title="googleStore.isConnected ? 'Google Calendar Connected' : 'Connect Google Calendar'"
        >
          <svg viewBox="0 0 24 24" width="14" height="14">
            <path fill="#EA4335" d="M12 5c1.54 0 2.93.57 4.02 1.5l3.01-3.01C17.2 1.77 14.77 1 12 1 7.42 1 3.53 3.59 1.63 7.36l3.66 2.84C6.18 7.35 8.84 5 12 5z" />
            <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58l3.71 2.88c2.16-2 3.71-4.94 3.71-8.7z" />
            <path fill="#FBBC05" d="M5.29 14.8c-.24-.72-.38-1.49-.38-2.3s.14-1.58.38-2.3L1.63 7.36C.59 9.44 0 11.66 0 14s.59 4.56 1.63 6.64l3.66-2.84z" />
            <path fill="#34A853" d="M12 23c3.24 0 5.95-1.08 7.93-2.91l-3.71-2.88c-1.07.72-2.45 1.16-4.22 1.16-3.16 0-5.82-2.35-6.71-5.2L1.63 15.99C3.53 19.41 7.42 23 12 23z" />
          </svg>
          <span class="d-none d-sm-inline">Google Cal</span>
          <span v-if="googleStore.isConnected" class="badge bg-success-subtle text-success p-1 rounded-pill" style="font-size: 0.6rem;">On</span>
        </button>

        <!-- Manage Categories Button -->
        <button class="btn btn-outline-secondary btn-sm" @click="isCategoryModalOpen = true">
          <i class="bi bi-tags me-1"></i>
          {{ $t('scheduler.categories') || 'Categories' }}
        </button>

        <!-- Sync Now Button -->
        <button
          class="btn btn-outline-primary btn-sm"
          :disabled="syncStatus.state === 'syncing'"
          @click="triggerManualSync"
          :title="'Status: ' + syncStatus.state"
        >
          <i class="bi bi-arrow-repeat me-1" :class="{ 'spin-animation': syncStatus.state === 'syncing' }"></i>
          <span class="d-none d-sm-inline">{{ syncStatus.state === 'syncing' ? 'Syncing...' : 'Sync Cloud' }}</span>
        </button>

        <!-- New Task Button -->
        <button class="btn btn-primary btn-sm fw-bold shadow-sm" @click="openNewTaskModal()">
          <i class="bi bi-plus-lg me-1"></i>
          {{ $t('scheduler.newTask') || 'New Task' }}
        </button>
      </div>
    </div>

    <!-- Permission Banner -->
    <NotificationBanner />

    <!-- KPI Summary Strip -->
    <div class="row g-3 mb-3">
      <div class="col-6 col-md-3">
        <div class="stat-card text-center py-2.5">
          <div class="text-muted small mb-1">Today's Tasks</div>
          <div class="fw-bold fs-5 text-primary">{{ taskStore.todayTaskCount }}</div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="stat-card text-center py-2.5">
          <div class="text-muted small mb-1">Completed Today</div>
          <div class="fw-bold fs-5 text-success">{{ taskStore.todayCompletedCount }}</div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="stat-card text-center py-2.5">
          <div class="text-muted small mb-1">Remaining</div>
          <div class="fw-bold fs-5 text-warning">
            {{ Math.max(0, taskStore.todayTaskCount - taskStore.todayCompletedCount) }}
          </div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="stat-card text-center py-2.5">
          <div class="text-muted small mb-1">Cloud Sync</div>
          <div class="fw-bold fs-6" :class="syncStatusClass">
            <i class="bi" :class="syncStatusIcon"></i>
            {{ syncStatusLabel }}
          </div>
        </div>
      </div>
    </div>

    <!-- View Mode Selector & Date Navigator -->
    <div class="card mb-3 border-0 shadow-xs control-panel-card">
      <div class="card-body p-2 d-flex flex-wrap justify-content-between align-items-center gap-2">
        <!-- View Switcher Tabs -->
        <div class="btn-group btn-group-sm view-switcher-group" role="group">
          <button
            type="button"
            class="btn"
            :class="taskStore.viewMode === 'day' ? 'btn-primary' : 'btn-outline-secondary'"
            @click="taskStore.setViewMode('day')"
          >
            <i class="bi bi-clock me-1"></i> Day
          </button>
          <button
            type="button"
            class="btn"
            :class="taskStore.viewMode === 'week' ? 'btn-primary' : 'btn-outline-secondary'"
            @click="taskStore.setViewMode('week')"
          >
            <i class="bi bi-calendar-week me-1"></i> Week
          </button>
          <button
            type="button"
            class="btn"
            :class="taskStore.viewMode === 'month' ? 'btn-primary' : 'btn-outline-secondary'"
            @click="taskStore.setViewMode('month')"
          >
            <i class="bi bi-calendar3 me-1"></i> Month
          </button>
          <button
            type="button"
            class="btn"
            :class="taskStore.viewMode === 'agenda' ? 'btn-primary' : 'btn-outline-secondary'"
            @click="taskStore.setViewMode('agenda')"
          >
            <i class="bi bi-view-list me-1"></i> Agenda
          </button>
          <button
            type="button"
            class="btn"
            :class="taskStore.viewMode === 'list' ? 'btn-primary' : 'btn-outline-secondary'"
            @click="taskStore.setViewMode('list')"
          >
            <i class="bi bi-check2-all me-1"></i> Filtered List
          </button>
        </div>

        <!-- Date Controls (For Day/Week mode) -->
        <div class="d-flex align-items-center gap-1">
          <button class="btn btn-outline-secondary btn-sm" @click="changeDateBy(-1)">
            <i class="bi bi-chevron-left"></i>
          </button>
          <span class="fw-semibold px-2 small">{{ currentDateDisplay }}</span>
          <button class="btn btn-outline-secondary btn-sm" @click="changeDateBy(1)">
            <i class="bi bi-chevron-right"></i>
          </button>
          <button class="btn btn-sm btn-outline-primary ms-1" @click="goToToday">
            Today
          </button>
        </div>
      </div>
    </div>

    <!-- Filter Bar (When in List mode or to filter tasks) -->
    <div class="card mb-3 border-0 shadow-xs filter-card">
      <div class="card-body p-2.5">
        <div class="row g-2 align-items-center">
          <!-- Search -->
          <div class="col-12 col-md-4">
            <div class="input-group input-group-sm">
              <span class="input-group-text bg-transparent border-end-0">
                <i class="bi bi-search text-muted"></i>
              </span>
              <input
                v-model="searchQuery"
                type="text"
                class="form-control border-start-0"
                placeholder="Search tasks & chores..."
                @input="handleSearch"
              />
            </div>
          </div>

          <!-- Category Filter -->
          <div class="col-6 col-md-3">
            <select
              v-model="selectedCategoryId"
              class="form-select form-select-sm"
              @change="handleCategoryFilter"
            >
              <option :value="null">All Categories</option>
              <option
                v-for="cat in categoryStore.categories"
                :key="cat.id"
                :value="cat.id"
              >
                {{ cat.name }}
              </option>
            </select>
          </div>

          <!-- Member Filter -->
          <div class="col-6 col-md-3">
            <select
              v-model="selectedMemberId"
              class="form-select form-select-sm"
              @change="handleMemberFilter"
            >
              <option :value="null">All Family Members</option>
              <option
                v-for="m in memberStore.members"
                :key="m.id"
                :value="m.id"
              >
                {{ m.name }} ({{ m.role }})
              </option>
            </select>
          </div>

          <!-- Status Filter Tabs (For list mode) -->
          <div v-if="taskStore.viewMode === 'list'" class="col-12 mt-2">
            <div class="d-flex gap-1 flex-wrap">
              <button
                v-for="st in ['all', 'today', 'upcoming', 'overdue', 'completed']"
                :key="st"
                class="btn btn-sm text-capitalize filter-pill-btn"
                :class="taskStore.activeFilter === st ? 'btn-primary' : 'btn-outline-secondary'"
                @click="taskStore.setActiveFilter(st)"
              >
                {{ st }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Active View Display -->
    <div class="view-content-wrapper">
      <!-- 1. Day View -->
      <DayView
        v-if="taskStore.viewMode === 'day'"
        :tasks="taskStore.tasksForSelectedDate"
        :selected-date="taskStore.selectedDate"
        @select-task="handleSelectTask"
        @click-slot="handleSlotClick"
      />

      <!-- 2. Week View -->
      <WeekView
        v-else-if="taskStore.viewMode === 'week'"
        :tasks="taskStore.tasks"
        :selected-date="taskStore.selectedDate"
        :members="memberStore.members"
        @select-task="handleSelectTask"
        @toggle-task="handleToggleStatus"
        @update:selected-date="taskStore.setSelectedDate"
      />

      <!-- 3. Month View -->
      <MonthView
        v-else-if="taskStore.viewMode === 'month'"
        :tasks="taskStore.tasks"
        :selected-date="taskStore.selectedDate"
        :members="memberStore.members"
        @select-task="handleSelectTask"
        @toggle-task="handleToggleStatus"
        @update:selected-date="taskStore.setSelectedDate"
      />

      <!-- 4. Agenda View -->
      <AgendaView
        v-else-if="taskStore.viewMode === 'agenda'"
        :tasks="taskStore.filteredTasks"
        :members="memberStore.members"
        @select-task="handleSelectTask"
        @toggle-task="handleToggleStatus"
      />

      <!-- 5. Filtered List View -->
      <div v-else-if="taskStore.viewMode === 'list'" class="list-view-container">
        <div v-if="taskStore.filteredTasks.length === 0" class="empty-card text-center p-5">
          <i class="bi bi-clipboard2-x fs-1 text-muted mb-2 d-block"></i>
          <h6 class="fw-bold text-muted">No tasks found</h6>
          <p class="text-muted small mb-0">Try clearing your filters or create a new task.</p>
        </div>
        <div v-else class="task-list">
          <TaskCard
            v-for="task in taskStore.filteredTasks"
            :key="task.id"
            :task="task"
            :members="memberStore.members"
            @click="handleSelectTask(task)"
            @toggle="handleToggleStatus(task)"
          />
        </div>
      </div>
    </div>

    <!-- Modals -->
    <TaskFormModal
      :is-open="isFormModalOpen"
      :initial-task="selectedTaskToEdit"
      :default-date="taskStore.selectedDate"
      :default-time="defaultSlotTime"
      :categories="categoryStore.categories"
      :members="memberStore.members"
      @close="closeFormModal"
      @submit="handleSaveTask"
    />

    <TaskDetailModal
      :is-open="isDetailModalOpen"
      :task="selectedTask"
      :members="memberStore.members"
      @close="isDetailModalOpen = false"
      @edit="openEditTaskModal"
      @delete="handleDeleteTask"
      @toggle-status="handleToggleFromDetail"
    />

    <CategoryManageModal
      :is-open="isCategoryModalOpen"
      :categories="categoryStore.categories"
      @close="isCategoryModalOpen = false"
      @create="handleCreateCategory"
      @delete="handleDeleteCategory"
    />

    <GoogleCalendarModal
      :is-open="isGoogleModalOpen"
      @close="isGoogleModalOpen = false"
    />

    <!-- Mobile Floating Action Button (FAB) -->
    <button class="scheduler-fab d-md-none shadow-lg" @click="openNewTaskModal()">
      <i class="bi bi-plus-lg"></i>
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { format, addDays, subDays } from 'date-fns';
import { useSchedulerTaskStore } from '../stores/schedulerTask';
import { useSchedulerCategoryStore } from '../stores/schedulerCategory';
import { useMemberStore } from '../stores/members';
import { useAuthStore } from '../stores/auth';
import { schedulerSyncService } from '../services/scheduler/schedulerSyncService';
import { getTodayDateString, parseLocalDate, formatDateKey } from '../utils/schedulerDate';

import DayView from '../components/scheduler/DayView.vue';
import WeekView from '../components/scheduler/WeekView.vue';
import MonthView from '../components/scheduler/MonthView.vue';
import AgendaView from '../components/scheduler/AgendaView.vue';
import TaskCard from '../components/scheduler/TaskCard.vue';
import TaskFormModal from '../components/scheduler/TaskFormModal.vue';
import TaskDetailModal from '../components/scheduler/TaskDetailModal.vue';
import CategoryManageModal from '../components/scheduler/CategoryManageModal.vue';
import GoogleCalendarModal from '../components/scheduler/GoogleCalendarModal.vue';
import NotificationBanner from '../components/scheduler/NotificationBanner.vue';
import { useGoogleCalendarStore } from '../stores/googleCalendar';

const taskStore = useSchedulerTaskStore();
const categoryStore = useSchedulerCategoryStore();
const memberStore = useMemberStore();
const authStore = useAuthStore();
const googleStore = useGoogleCalendarStore();

// Modals State
const isFormModalOpen = ref(false);
const isDetailModalOpen = ref(false);
const isCategoryModalOpen = ref(false);
const isGoogleModalOpen = ref(false);
const selectedTask = ref(null);
const selectedTaskToEdit = ref(null);
const defaultSlotTime = ref(null);

// Filter Form State
const searchQuery = ref('');
const selectedCategoryId = ref(null);
const selectedMemberId = ref(null);

// Cloud Sync State
const syncStatus = ref(schedulerSyncService.getStatus());
let unsubscribeSync = null;

onMounted(async () => {
  const familyId = authStore.familyId;

  // Subscribe to sync status updates
  unsubscribeSync = schedulerSyncService.onStatusChange((status) => {
    syncStatus.value = status;
  });

  // Load categories and tasks from Dexie
  await categoryStore.fetchCategories(familyId);
  await taskStore.fetchTasks(familyId);

  // Load family members
  if (!memberStore.members.length) {
    await memberStore.fetchMembers();
  }

  // Init Google Calendar
  await googleStore.init();

  // Trigger background cloud sync
  if (familyId) {
    schedulerSyncService.triggerSync(familyId);
    if (googleStore.isConnected && googleStore.autoSyncEnabled) {
      googleStore.sync(familyId, authStore.user?.id).catch((e) => console.warn('GCal auto-sync error:', e));
    }
  }
});

const currentDateDisplay = computed(() => {
  const d = parseLocalDate(taskStore.selectedDate);
  return format(d, 'EEE, d MMM yyyy');
});

const syncStatusClass = computed(() => {
  switch (syncStatus.value.state) {
    case 'synced':
      return 'text-success';
    case 'syncing':
      return 'text-primary';
    case 'offline':
      return 'text-secondary';
    case 'error':
      return 'text-danger';
    default:
      return 'text-muted';
  }
});

const syncStatusIcon = computed(() => {
  switch (syncStatus.value.state) {
    case 'synced':
      return 'bi-cloud-check-fill me-1';
    case 'syncing':
      return 'bi-cloud-arrow-up-fill me-1 spin-animation';
    case 'offline':
      return 'bi-cloud-slash me-1';
    case 'error':
      return 'bi-cloud-exclamation-fill me-1';
    default:
      return 'bi-cloud me-1';
  }
});

const syncStatusLabel = computed(() => {
  switch (syncStatus.value.state) {
    case 'synced':
      return 'Synced';
    case 'syncing':
      return 'Syncing...';
    case 'offline':
      return 'Offline';
    case 'error':
      return 'Sync Error';
    default:
      return 'Ready';
  }
});

function changeDateBy(delta) {
  const current = parseLocalDate(taskStore.selectedDate);
  const newDate = delta > 0 ? addDays(current, delta) : subDays(current, Math.abs(delta));
  taskStore.setSelectedDate(formatDateKey(newDate));
}

function goToToday() {
  taskStore.setSelectedDate(getTodayDateString());
}

function handleSearch() {
  taskStore.setSearchQuery(searchQuery.value);
}

function handleCategoryFilter() {
  taskStore.setCategoryId(selectedCategoryId.value);
}

function handleMemberFilter() {
  taskStore.setMemberId(selectedMemberId.value);
}

function openNewTaskModal(timeString = null) {
  selectedTaskToEdit.value = null;
  defaultSlotTime.value = timeString;
  isFormModalOpen.value = true;
}

function handleSlotClick(timeString) {
  openNewTaskModal(timeString);
}

function handleSelectTask(task) {
  selectedTask.value = task;
  isDetailModalOpen.value = true;
}

function openEditTaskModal(task) {
  isDetailModalOpen.value = false;
  selectedTaskToEdit.value = task;
  isFormModalOpen.value = true;
}

function closeFormModal() {
  isFormModalOpen.value = false;
  selectedTaskToEdit.value = null;
  defaultSlotTime.value = null;
}

async function handleSaveTask(payload) {
  const familyId = authStore.familyId;
  const userId = authStore.user?.id;

  if (selectedTaskToEdit.value) {
    await taskStore.editTask(selectedTaskToEdit.value.id, payload);
  } else {
    await taskStore.addTask(payload, familyId, userId);
  }

  closeFormModal();

  // Background sync
  if (familyId) {
    schedulerSyncService.triggerSync(familyId);
    if (googleStore.isConnected && (googleStore.autoSyncEnabled || payload.external_provider === 'google')) {
      googleStore.sync(familyId, userId).catch((e) => console.warn('GCal sync error:', e));
    }
  }
}

async function handleToggleStatus(task) {
  await taskStore.toggleStatus(task.id);
  if (authStore.familyId) {
    schedulerSyncService.triggerSync(authStore.familyId);
  }
}

async function handleToggleFromDetail(task) {
  const updated = await taskStore.toggleStatus(task.id);
  if (updated) {
    selectedTask.value = updated;
  }
  if (authStore.familyId) {
    schedulerSyncService.triggerSync(authStore.familyId);
  }
}

async function handleDeleteTask(taskId) {
  await taskStore.removeTask(taskId);
  isDetailModalOpen.value = false;
  selectedTask.value = null;
  if (authStore.familyId) {
    schedulerSyncService.triggerSync(authStore.familyId);
  }
}

async function handleCreateCategory(categoryInput) {
  await categoryStore.addCategory(categoryInput, authStore.familyId, authStore.user?.id);
  if (authStore.familyId) {
    schedulerSyncService.triggerSync(authStore.familyId);
  }
}

async function handleDeleteCategory(categoryId) {
  await categoryStore.removeCategory(categoryId);
  if (authStore.familyId) {
    schedulerSyncService.triggerSync(authStore.familyId);
  }
}

function triggerManualSync() {
  if (authStore.familyId) {
    schedulerSyncService.triggerSync(authStore.familyId);
  }
}
</script>

<style scoped>
.scheduler-page {
  max-width: 1200px;
  margin: 0 auto;
  padding-bottom: 5rem;
}

.control-panel-card,
.filter-card {
  background: var(--card-bg, #ffffff);
  border: 1px solid var(--border-color, #e2e8f0) !important;
  border-radius: 1rem;
}

.stat-card {
  background: var(--card-bg, #ffffff);
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 1rem;
}

.filter-pill-btn {
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 9999px;
  padding: 0.25rem 0.75rem;
}

.empty-card {
  background: var(--card-bg, #ffffff);
  border: 1px dashed var(--border-color, #cbd5e1);
  border-radius: 1.25rem;
}

.spin-animation {
  animation: spin 1s linear infinite;
  display: inline-block;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.scheduler-fab {
  position: fixed;
  bottom: max(1.5rem, env(safe-area-inset-bottom, 1.5rem));
  right: 1.25rem;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: var(--primary, #4f46e5);
  color: #ffffff;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  z-index: 1040;
  cursor: pointer;
  box-shadow: 0 6px 16px rgba(79, 70, 229, 0.4);
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.scheduler-fab:hover {
  transform: scale(1.08);
}

/* ===== Mobile Responsiveness & PWA Touch Optimizations ===== */
@media (max-width: 768px) {
  .view-switcher-group {
    display: flex !important;
    width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    padding-bottom: 2px;
  }

  .view-switcher-group::-webkit-scrollbar {
    display: none;
  }

  .view-switcher-group .btn {
    flex-shrink: 0;
    border-radius: 8px !important;
    margin-right: 4px;
    font-size: 0.8rem;
    padding: 0.35rem 0.65rem;
    white-space: nowrap;
  }

  .control-panel-card .card-body {
    flex-direction: column;
    align-items: stretch !important;
    gap: 0.75rem !important;
  }
}
</style>
