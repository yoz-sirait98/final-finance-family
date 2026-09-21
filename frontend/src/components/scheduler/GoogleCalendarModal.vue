<template>
  <div v-if="isOpen" class="modal-backdrop-custom" @click.self="$emit('close')">
    <div class="modal-dialog-custom">
      <div class="modal-content-custom">
        <!-- Header -->
        <div class="modal-header-custom d-flex justify-content-between align-items-center">
          <div class="d-flex align-items-center gap-2">
            <svg class="google-icon" viewBox="0 0 24 24" width="22" height="22">
              <path fill="#EA4335" d="M12 5c1.54 0 2.93.57 4.02 1.5l3.01-3.01C17.2 1.77 14.77 1 12 1 7.42 1 3.53 3.59 1.63 7.36l3.66 2.84C6.18 7.35 8.84 5 12 5z" />
              <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58l3.71 2.88c2.16-2 3.71-4.94 3.71-8.7z" />
              <path fill="#FBBC05" d="M5.29 14.8c-.24-.72-.38-1.49-.38-2.3s.14-1.58.38-2.3L1.63 7.36C.59 9.44 0 11.66 0 14s.59 4.56 1.63 6.64l3.66-2.84z" />
              <path fill="#34A853" d="M12 23c3.24 0 5.95-1.08 7.93-2.91l-3.71-2.88c-1.07.72-2.45 1.16-4.22 1.16-3.16 0-5.82-2.35-6.71-5.2L1.63 15.99C3.53 19.41 7.42 23 12 23z" />
            </svg>
            <h5 class="mb-0 fw-bold">Google Calendar Sync</h5>
          </div>
          <button class="btn-close-custom" @click="$emit('close')">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <!-- Body -->
        <div class="modal-body-custom">
          <!-- DISCONNECTED STATE -->
          <div v-if="!googleStore.isConnected" class="d-flex flex-column gap-3">
            <div class="text-center py-2">
              <i class="bi bi-calendar-range text-primary fs-1 mb-2 d-block"></i>
              <h6 class="fw-bold mb-1">Two-Way Google Calendar Sync</h6>
              <p class="text-muted small mb-0">
                Connect your Google account to automatically synchronize personal and family events with your Family Scheduler.
              </p>
            </div>

            <!-- Error Banner -->
            <div v-if="googleStore.errorMessage" class="alert alert-danger py-2 px-3 small mb-0">
              <i class="bi bi-exclamation-triangle-fill me-1"></i>
              {{ googleStore.errorMessage }}
            </div>

            <!-- Connection Buttons -->
            <div class="d-grid gap-2">
              <button
                class="btn btn-primary d-flex align-items-center justify-content-center gap-2 fw-bold py-2 shadow-sm"
                :disabled="isConnecting"
                @click="handleConnect"
              >
                <i class="bi bi-google"></i>
                {{ isConnecting ? 'Connecting...' : 'Connect Google Calendar' }}
              </button>

              <button
                class="btn btn-outline-secondary btn-sm"
                @click="handleEnableMock"
              >
                <i class="bi bi-lightning-charge text-warning me-1"></i>
                Try Demo Simulator Mode
              </button>
            </div>

            <!-- Client ID Configuration Section -->
            <div class="card p-3 bg-body-tertiary border">
              <div
                class="d-flex justify-content-between align-items-center cursor-pointer"
                @click="showClientIdInput = !showClientIdInput"
              >
                <span class="small fw-semibold text-muted">
                  <i class="bi bi-gear me-1"></i> Google Client ID Settings
                </span>
                <i class="bi small text-muted" :class="showClientIdInput ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
              </div>

              <div v-if="showClientIdInput" class="mt-2 pt-2 border-top">
                <p class="text-muted extra-small mb-2">
                  Create OAuth 2.0 Web Client Credentials in the Google Cloud Console with authorized Javascript Origins.
                </p>
                <div class="input-group input-group-sm">
                  <input
                    v-model="tempClientId"
                    type="text"
                    class="form-control"
                    placeholder="e.g. 123456...apps.googleusercontent.com"
                  />
                  <button class="btn btn-outline-primary" @click="saveClientId">
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- CONNECTED STATE -->
          <div v-else class="d-flex flex-column gap-3">
            <!-- Account Info Card -->
            <div class="p-3 rounded-3 bg-primary-subtle border border-primary-subtle d-flex align-items-center justify-content-between">
              <div class="d-flex align-items-center gap-2.5">
                <img
                  v-if="googleStore.account?.picture"
                  :src="googleStore.account.picture"
                  class="rounded-circle"
                  width="36"
                  height="36"
                  alt="Avatar"
                />
                <div v-else class="avatar-placeholder rounded-circle bg-primary text-white d-flex align-items-center justify-content-center">
                  {{ googleStore.account?.name?.charAt(0) || 'G' }}
                </div>
                <div>
                  <div class="fw-bold small">{{ googleStore.account?.name }}</div>
                  <div class="text-muted extra-small">{{ googleStore.account?.email }}</div>
                </div>
              </div>

              <div class="d-flex align-items-center gap-2">
                <span class="badge" :class="googleStore.account?.isMock ? 'bg-warning text-dark' : 'bg-success'">
                  {{ googleStore.account?.isMock ? 'Demo Mode' : 'Connected' }}
                </span>
                <button class="btn btn-outline-danger btn-sm p-1 px-2" @click="handleDisconnect" title="Disconnect Google Calendar">
                  <i class="bi bi-box-arrow-right"></i>
                </button>
              </div>
            </div>

            <!-- Calendar Selector -->
            <div class="card p-3 border">
              <div class="d-flex justify-content-between align-items-center mb-1">
                <label class="form-label small fw-bold mb-0">Target Google Calendar</label>
                <button
                  class="btn btn-link btn-sm p-0 text-decoration-none small"
                  @click="googleStore.refreshCalendars"
                >
                  <i class="bi bi-arrow-clockwise me-1"></i> Refresh
                </button>
              </div>
              <select
                :value="googleStore.selectedCalendarId"
                class="form-select form-select-sm"
                @change="handleCalendarChange"
              >
                <option value="primary">Primary (Default Calendar)</option>
                <option
                  v-for="cal in googleStore.calendars.filter((c) => c.id !== 'primary')"
                  :key="cal.id"
                  :value="cal.id"
                >
                  {{ cal.summary }} {{ cal.primary ? '(Primary)' : '' }}
                </option>
              </select>
            </div>

            <!-- Auto Sync Switch -->
            <div class="card p-3 border d-flex flex-row align-items-center justify-content-between">
              <div>
                <span class="small fw-bold d-block">Automatic Sync</span>
                <span class="text-muted extra-small">Sync new tasks and edits automatically</span>
              </div>
              <div class="form-check form-switch mb-0">
                <input
                  class="form-check-input"
                  type="checkbox"
                  :checked="googleStore.autoSyncEnabled"
                  @change="googleStore.toggleAutoSync"
                />
              </div>
            </div>

            <!-- Sync Action & Status -->
            <div class="card p-3 border">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <span class="small fw-bold d-block">Sync Status</span>
                  <span class="text-muted extra-small">
                    {{ googleStore.lastSyncStats ? 'Last synced: ' + formatTimestamp(googleStore.lastSyncStats.lastSyncedAt) : 'Not synced yet' }}
                  </span>
                  <div v-if="googleStore.lastSyncStats" class="text-success extra-small mt-1">
                    ✓ {{ googleStore.lastSyncStats.eventsImported }} imported, {{ googleStore.lastSyncStats.tasksExported }} exported, {{ googleStore.lastSyncStats.eventsUpdated }} updated
                  </div>
                </div>

                <button
                  class="btn btn-primary btn-sm fw-bold d-flex align-items-center gap-1 shadow-sm"
                  :disabled="googleStore.isSyncing"
                  @click="triggerSync"
                >
                  <i class="bi bi-arrow-repeat" :class="{ 'spin-animation': googleStore.isSyncing }"></i>
                  <span>{{ googleStore.isSyncing ? 'Syncing...' : 'Sync Now' }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="modal-footer-custom d-flex justify-content-end p-3 border-top">
          <button class="btn btn-secondary btn-sm" @click="$emit('close')">
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useGoogleCalendarStore } from '../../stores/googleCalendar';
import { useAuthStore } from '../../stores/auth';
import { useSchedulerTaskStore } from '../../stores/schedulerTask';

defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
});

defineEmits(['close']);

const googleStore = useGoogleCalendarStore();
const authStore = useAuthStore();
const taskStore = useSchedulerTaskStore();

const isConnecting = ref(false);
const showClientIdInput = ref(false);
const tempClientId = ref(googleStore.clientId);

onMounted(() => {
  googleStore.init();
});

async function handleConnect() {
  isConnecting.value = true;
  try {
    const success = await googleStore.connect();
    if (success) {
      await triggerSync();
    }
  } finally {
    isConnecting.value = false;
  }
}

function handleEnableMock() {
  googleStore.connectMock();
  triggerSync();
}

function handleDisconnect() {
  if (confirm('Disconnect Google Calendar synchronization?')) {
    googleStore.disconnect();
  }
}

function saveClientId() {
  googleStore.setClientId(tempClientId.value);
  alert('Google Client ID saved!');
}

function handleCalendarChange(e) {
  googleStore.setSelectedCalendar(e.target.value);
}

async function triggerSync() {
  try {
    await googleStore.sync(authStore.familyId, authStore.user?.id);
    // Reload tasks into store
    await taskStore.fetchTasks(authStore.familyId);
  } catch (e) {
    console.warn('Sync trigger error:', e);
  }
}

function formatTimestamp(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
  max-width: 500px;
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

.avatar-placeholder {
  width: 36px;
  height: 36px;
  font-size: 0.9rem;
  font-weight: 700;
}

.extra-small {
  font-size: 0.75rem;
}

.cursor-pointer {
  cursor: pointer;
}

.spin-animation {
  animation: spin 1s linear infinite;
  display: inline-block;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
