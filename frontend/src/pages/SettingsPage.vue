<template>
  <div class="settings-page fade-in">
    <div id="tour-settings-header" class="page-header">
      <h4>{{ $t('settings.title') }}</h4>
      <p>{{ $t('settings.subtitle') }}</p>
    </div>
    <div class="row g-4">
      <div class="col-lg-6">
        <!-- Profile info -->
        <div id="tour-settings-profile" class="stat-card mb-4">
          <h6 class="fw-bold mb-3"><i class="bi bi-person me-2"></i>{{ $t('settings.profile') }}</h6>
          <div v-if="authStore.user">
            <div class="mb-2"><strong>{{ $t('common.name') }}:</strong> {{ authStore.userName }}</div>
            <div class="mb-2"><strong>{{ $t('auth.login.email') }}:</strong> {{ authStore.session?.user?.email }}</div>
          </div>
        </div>

        <!-- Language Preference -->
        <div id="tour-settings-language" class="stat-card mb-4">
          <h6 class="fw-bold mb-3"><i class="bi bi-translate me-2"></i>{{ $t('settings.languagePref') }}</h6>
          <div class="mb-3">
            <label class="form-label">{{ $t('settings.selectLanguage') }}</label>
            <select
              :value="localeStore.currentLocale"
              @change="localeStore.setLocale($event.target.value)"
              class="form-select"
            >
              <option value="en">English</option>
              <option value="id">Indonesia</option>
            </select>
          </div>
        </div>

        <!-- PWA Push Notifications -->
        <div id="tour-settings-pwa" class="stat-card mb-4">
          <h6 class="fw-bold mb-3"><i class="bi bi-bell me-2 text-primary"></i>{{ localeStore.currentLocale === 'id' ? 'Notifikasi PWA Push' : 'PWA Push Notifications' }}</h6>
          <div class="d-flex align-items-center justify-content-between">
            <div>
              <div class="fw-semibold small">{{ localeStore.currentLocale === 'id' ? 'Status Notifikasi Browser' : 'Browser Push Status' }}</div>
              <div class="text-muted small">
                {{ localeStore.currentLocale === 'id' ? 'Bahasa notifikasi otomatis menyesuaikan dengan pilihan aplikasi (' + localeStore.currentLocale.toUpperCase() + ').' : 'Push notifications automatically match your selected app language (' + localeStore.currentLocale.toUpperCase() + ').' }}
              </div>
            </div>
            <PushNotificationToggle />
          </div>
        </div>

        <!-- AI Configuration -->
        <div id="tour-settings-ai" class="stat-card">
          <div class="d-flex align-items-center justify-content-between mb-3">
            <h6 class="fw-bold mb-0"><i class="bi bi-stars me-2 text-primary"></i>{{ $t('settings.aiConfig') || 'AI & Model Configuration' }}</h6>
            <span class="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-2.5 py-1">
              {{ activeProviderBadge }}
            </span>
          </div>

          <!-- Active AI Coach Selector -->
          <div class="mb-4 p-3 rounded-3 bg-light bg-opacity-50 border">
            <label class="form-label fw-semibold small mb-2 d-flex align-items-center justify-content-between">
              <span><i class="bi bi-cpu me-1 text-primary"></i>{{ $t('settings.activeAiModel') || 'Active AI Coach Engine' }}</span>
            </label>
            <select v-model="activeModelConfig" class="form-select form-select-sm" @change="saveActiveModel">
              <optgroup label="Google Gemini">
                <option value="gemini:gemini-flash-lite-latest">Gemini 2.5 Flash Lite (Fast & Multimodal)</option>
              </optgroup>
              <optgroup label="DeepSeek (Official)">
                <option value="deepseek:deepseek-chat">DeepSeek V3 (Chat & Financial Advice)</option>
                <option value="deepseek:deepseek-reasoner">DeepSeek R1 (Deep Mathematical Reasoner)</option>
              </optgroup>
              <optgroup label="Groq (Free & Ultra Fast)">
                <option value="groq:openai/gpt-oss-20b">Groq GPT-OSS 20B (Fast & Reasoning)</option>
                <option value="groq:qwen/qwen3.6-27b">Groq Qwen 3.6 27B (Thinking Engine)</option>
              </optgroup>
              <optgroup label="OpenRouter">
                <option value="openrouter:google/gemma-4-31b-it:free">OpenRouter (Multi-Model Hub)</option>
              </optgroup>
            </select>
          </div>

          <!-- Provider Tabs / Key Inputs -->
          <div class="d-flex flex-column gap-3">
            <!-- 1. DeepSeek -->
            <div class="p-3 rounded-3 border" :class="{ 'border-primary border-opacity-50 bg-primary bg-opacity-10': activeProvider === 'deepseek' }">
              <div class="d-flex align-items-center justify-content-between mb-1">
                <label class="form-label fw-semibold mb-0 small"><i class="bi bi-robot me-1 text-info"></i>{{ $t('settings.deepseekApiKey') || 'DeepSeek API Key' }}</label>
                <span v-if="deepseekApiKey" class="badge bg-success bg-opacity-10 text-success small">Configured</span>
              </div>
              <div class="input-group input-group-sm mt-1">
                <input
                  v-model="deepseekApiKey"
                  type="password"
                  class="form-control"
                  placeholder="sk-..."
                />
                <button class="btn btn-primary-gradient" @click="saveDeepSeekKey" :disabled="isSavingDeepSeek">
                  <span v-if="isSavingDeepSeek" class="spinner-border spinner-border-sm me-1"></span>
                  {{ isSavingDeepSeek ? ($t('common.loading') || 'Checking...') : ($t('common.save') || 'Save') }}
                </button>
              </div>
              <div class="form-text x-small text-muted mt-1">
                Get your key at <a href="https://platform.deepseek.com" target="_blank" class="text-primary text-decoration-underline">platform.deepseek.com</a>. Powers V3 Chat and R1 Reasoner.
              </div>
            </div>

            <!-- 2. Groq (Free) -->
            <div class="p-3 rounded-3 border" :class="{ 'border-primary border-opacity-50 bg-primary bg-opacity-10': activeProvider === 'groq' }">
              <div class="d-flex align-items-center justify-content-between mb-1">
                <label class="form-label fw-semibold mb-0 small"><i class="bi bi-lightning-charge-fill me-1 text-warning"></i>{{ $t('settings.groqApiKey') || 'Groq API Key (Free)' }}</label>
                <span v-if="groqApiKey" class="badge bg-success bg-opacity-10 text-success small">Configured</span>
              </div>
              <div class="input-group input-group-sm mt-1">
                <input
                  v-model="groqApiKey"
                  type="password"
                  class="form-control"
                  placeholder="gsk_..."
                />
                <button class="btn btn-primary-gradient" @click="saveGroqKey" :disabled="isSavingGroq">
                  <span v-if="isSavingGroq" class="spinner-border spinner-border-sm me-1"></span>
                  {{ isSavingGroq ? ($t('common.loading') || 'Checking...') : ($t('common.save') || 'Save') }}
                </button>
              </div>
              <div class="form-text x-small text-muted mt-1">
                Free key at <a href="https://console.groq.com" target="_blank" class="text-primary text-decoration-underline">console.groq.com</a>. Ultra-fast inference with chain-of-thought.
              </div>
            </div>

            <!-- 3. Google Gemini -->
            <div class="p-3 rounded-3 border" :class="{ 'border-primary border-opacity-50 bg-primary bg-opacity-10': activeProvider === 'gemini' }">
              <div class="d-flex align-items-center justify-content-between mb-1">
                <label class="form-label fw-semibold mb-0 small"><i class="bi bi-google me-1 text-danger"></i>{{ $t('settings.geminiApiKey') || 'Gemini API Key' }}</label>
                <span v-if="geminiApiKey" class="badge bg-success bg-opacity-10 text-success small">Configured</span>
              </div>
              <div class="input-group input-group-sm mt-1">
                <input
                  v-model="geminiApiKey"
                  type="password"
                  class="form-control"
                  placeholder="AIzaSy..."
                />
                <button id="tour-settings-add-btn" class="btn btn-primary-gradient" @click="saveGeminiKey" :disabled="isSavingKey">
                  <span v-if="isSavingKey" class="spinner-border spinner-border-sm me-1"></span>
                  {{ isSavingKey ? ($t('common.loading') || 'Checking...') : ($t('common.save') || 'Save') }}
                </button>
              </div>
              <div class="form-text x-small text-muted mt-1">
                Free key from <a href="https://aistudio.google.com/" target="_blank" class="text-primary text-decoration-underline">Google AI Studio</a>. Powers Receipt OCR & Gemini Coach.
              </div>
            </div>

            <!-- 4. OpenRouter -->
            <div class="p-3 rounded-3 border" :class="{ 'border-primary border-opacity-50 bg-primary bg-opacity-10': activeProvider === 'openrouter' }">
              <div class="d-flex align-items-center justify-content-between mb-1">
                <label class="form-label fw-semibold mb-0 small"><i class="bi bi-hdd-network me-1 text-primary"></i>{{ $t('settings.openrouterApiKey') || 'OpenRouter API Key' }}</label>
                <span v-if="openrouterApiKey" class="badge bg-success bg-opacity-10 text-success small">Configured</span>
              </div>
              <div class="input-group input-group-sm mt-1">
                <input
                  v-model="openrouterApiKey"
                  type="password"
                  class="form-control"
                  placeholder="sk-or-v1-..."
                />
                <button class="btn btn-primary-gradient" @click="saveOpenRouterKey" :disabled="isSavingOpenRouter">
                  <span v-if="isSavingOpenRouter" class="spinner-border spinner-border-sm me-1"></span>
                  {{ isSavingOpenRouter ? ($t('common.loading') || 'Checking...') : ($t('common.save') || 'Save') }}
                </button>
              </div>
              <div class="form-text x-small text-muted mt-1">
                Multi-model router from <a href="https://openrouter.ai" target="_blank" class="text-primary text-decoration-underline">openrouter.ai</a>.
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-6">
        <!-- WhatsApp Integration -->
        <div id="tour-settings-whatsapp" class="stat-card mb-4">
          <h6 class="fw-bold mb-3"><i class="bi bi-whatsapp me-2 text-success"></i>WhatsApp Group</h6>
          <div class="mb-3">
            <label class="form-label">Group ID</label>
            <div class="input-group">
              <input
                v-model="whatsappGroupId"
                type="text"
                class="form-control"
                placeholder="1234567890-987654@g.us"
              />
              <button class="btn btn-primary-gradient" @click="saveWhatsAppGroupId" :disabled="isSavingGroupId">
                <span v-if="isSavingGroupId" class="spinner-border spinner-border-sm me-1"></span>
                {{ isSavingGroupId ? 'Saving...' : 'Save' }}
              </button>
            </div>
            <div class="form-text small text-muted mt-2">
              <i class="bi bi-info-circle me-1"></i>Add your Bot to a WhatsApp Group, type <code>!groupinfo</code> inside the group, and paste the ID here.
            </div>
          </div>
        </div>

        <!-- Google Calendar Integration -->
        <div id="tour-settings-google-calendar" class="stat-card mb-4">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <h6 class="fw-bold mb-0">
              <i class="bi bi-google me-2 text-danger"></i>Google Calendar Sync
            </h6>
            <span class="badge" :class="googleStore.isConnected ? 'bg-success' : 'bg-secondary'">
              {{ googleStore.isConnected ? 'Connected' : 'Not Connected' }}
            </span>
          </div>

          <p class="text-muted small mb-3">
            Synchronize family tasks, chores, and events with your Google Calendar account.
          </p>

          <div v-if="!googleStore.isConnected" class="d-flex gap-2 flex-wrap">
            <button class="btn btn-primary btn-sm fw-bold shadow-sm" @click="isGoogleModalOpen = true">
              <i class="bi bi-link-45deg me-1"></i> Connect Google Calendar
            </button>
            <button class="btn btn-outline-secondary btn-sm" @click="handleEnableGoogleMock">
              <i class="bi bi-lightning-charge text-warning me-1"></i> Try Demo Simulator
            </button>
          </div>

          <div v-else class="d-flex flex-column gap-2">
            <div class="d-flex align-items-center justify-content-between p-2 rounded-2 border" style="background: var(--card-bg);">
              <div class="d-flex align-items-center gap-2">
                <img v-if="googleStore.account?.picture" :src="googleStore.account.picture" class="rounded-circle" width="28" height="28" alt="Avatar" />
                <span class="small fw-semibold">{{ googleStore.account?.name }} ({{ googleStore.account?.email }})</span>
              </div>
              <button class="btn btn-sm btn-outline-danger p-1 px-2" @click="googleStore.disconnect">
                Disconnect
              </button>
            </div>

            <div class="d-flex justify-content-between align-items-center mt-1">
              <button class="btn btn-outline-primary btn-sm" @click="isGoogleModalOpen = true">
                <i class="bi bi-gear me-1"></i> Calendar Settings
              </button>
              <button class="btn btn-primary btn-sm fw-bold" :disabled="googleStore.isSyncing" @click="triggerGoogleSync">
                <i class="bi bi-arrow-repeat me-1" :class="{ 'spin-animation': googleStore.isSyncing }"></i>
                Sync Now
              </button>
            </div>
          </div>
        </div>

        <!-- Scheduler Notifications & Sound Settings -->
        <div id="tour-settings-scheduler-alarms" class="stat-card mb-4">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <h6 class="fw-bold mb-0">
              <i class="bi bi-bell-fill me-2 text-primary"></i>Scheduler Alarms & Sound
            </h6>
            <span
              class="badge"
              :class="schedulerNotifPermission === 'granted' ? 'bg-success' : 'bg-warning text-dark'"
            >
              {{ schedulerNotifPermission === 'granted' ? 'Alerts Enabled' : 'Alerts ' + schedulerNotifPermission }}
            </span>
          </div>

          <p class="text-muted small mb-3">
            Manage browser alerts, sound chimes, and reminders for scheduled family tasks and chores.
          </p>

          <div class="d-flex flex-column gap-3">
            <!-- Browser Permission Row -->
            <div class="d-flex align-items-center justify-content-between p-2 rounded-2 border" style="background: var(--card-bg);">
              <div>
                <span class="small fw-bold d-block">Browser Alerts</span>
                <span class="x-small text-muted">Permission: {{ schedulerNotifPermission }}</span>
              </div>
              <div class="d-flex gap-2">
                <button
                  v-if="schedulerNotifPermission !== 'granted'"
                  class="btn btn-primary btn-sm fw-bold"
                  @click="handleRequestNotifPermission"
                >
                  Enable Alerts
                </button>
                <button
                  v-else
                  class="btn btn-outline-secondary btn-sm"
                  @click="handleTestNotif"
                >
                  <i class="bi bi-bell me-1"></i> Test Alert
                </button>
              </div>
            </div>

            <!-- Audio Chime Row -->
            <div class="d-flex align-items-center justify-content-between p-2 rounded-2 border" style="background: var(--card-bg);">
              <div>
                <span class="small fw-bold d-block">Alarm Audio Chime</span>
                <span class="x-small text-muted">Synthesizer arpeggio when reminders trigger</span>
              </div>
              <div class="d-flex align-items-center gap-2">
                <button
                  class="btn btn-sm btn-outline-secondary"
                  @click="handleTestAudio"
                  title="Test Sound"
                >
                  <i class="bi bi-volume-up me-1"></i> Test Sound
                </button>
                <div class="form-check form-switch mb-0">
                  <input
                    v-model="isSchedulerSoundEnabled"
                    class="form-check-input"
                    type="checkbox"
                    id="schedulerSoundSwitch"
                    @change="handleSoundToggle"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Change Password -->
        <div id="tour-settings-password" class="stat-card h-100">
          <h6 class="fw-bold mb-3"><i class="bi bi-lock me-2"></i>{{ $t('settings.changePassword') }}</h6>
          <div v-if="success" class="alert alert-success small">{{ success }}</div>
          <div v-if="error" class="alert alert-danger small">{{ error }}</div>
          <form @submit.prevent="changePassword">
            <div class="mb-3">
              <label class="form-label">{{ $t('settings.currentPassword') }}</label>
              <input v-model="form.current_password" type="password" class="form-control" required />
            </div>
            <div class="mb-3">
              <label class="form-label">{{ $t('settings.newPassword') }}</label>
              <input v-model="form.password" type="password" class="form-control" minlength="8" required />
            </div>
            <div class="mb-3">
              <label class="form-label">{{ $t('settings.confirmPassword') }}</label>
              <input v-model="form.password_confirmation" type="password" class="form-control" required />
            </div>
            <button type="submit" class="btn btn-primary-gradient" :disabled="loading">
              <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
              {{ loading ? $t('settings.updatingPassword') : $t('settings.updatePassword') }}
            </button>
          </form>
        </div>
      </div>
    </div>

    <GoogleCalendarModal :is-open="isGoogleModalOpen" @close="isGoogleModalOpen = false" />
  </div>
</template>

<script setup>
import { useTour } from '../composables/useTour';
import { settingsTourSteps } from '../tours/settingsTour';

const { startAutoTour, startTour } = useTour('settings');
const handleTour = () => startTour(settingsTourSteps);

import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useLocaleStore } from '../stores/locale';
import { useToastStore } from '../stores/toast';
import { authService } from '../services/authService';
import PushNotificationToggle from '../components/PushNotificationToggle.vue';
import GoogleCalendarModal from '../components/scheduler/GoogleCalendarModal.vue';
import { useGoogleCalendarStore } from '../stores/googleCalendar';
import { reminderService } from '../services/scheduler/reminderService';
import { audioService } from '../services/scheduler/audioService';
import { supabase } from '../lib/supabase';

const authStore = useAuthStore();
const googleStore = useGoogleCalendarStore();
const isGoogleModalOpen = ref(false);

const schedulerNotifPermission = ref(reminderService.getNotificationPermission());
const isSchedulerSoundEnabled = ref(audioService.isSoundEnabled());

async function handleRequestNotifPermission() {
  const res = await reminderService.requestNotificationPermission();
  schedulerNotifPermission.value = res;
  if (res === 'granted') {
    reminderService.showNotification('YJS Scheduler Alerts', {
      body: 'Browser notifications are now enabled! 🎉',
    });
  }
}

function handleTestNotif() {
  reminderService.showNotification('YJS Scheduler Alert Test', {
    body: 'Browser notifications are working perfectly! 🎉',
  });
}

function handleTestAudio() {
  audioService.playConfirmSound();
}

function handleSoundToggle() {
  audioService.setSoundEnabled(isSchedulerSoundEnabled.value);
}

function handleEnableGoogleMock() {
  googleStore.connectMock();
  triggerGoogleSync();
}

async function triggerGoogleSync() {
  try {
    await googleStore.sync(authStore.familyId, authStore.user?.id);
  } catch (e) {
    console.warn('Google Calendar sync error:', e);
  }
}
const localeStore = useLocaleStore();
const toast = useToastStore();

const form = ref({ current_password: '', password: '', password_confirmation: '' });
const loading = ref(false);
const success = ref('');
const error = ref('');

// AI Provider & Keys State
const currentProvider = ref(localStorage.getItem('ai_provider') || 'gemini');
const currentModel = ref(localStorage.getItem('ai_model') || 'gemini-flash-lite-latest');
const activeModelConfig = ref(`${currentProvider.value}:${currentModel.value}`);

const activeProvider = computed(() => {
  return activeModelConfig.value.split(':')[0] || 'gemini';
});

const activeProviderBadge = computed(() => {
  const [provider, model] = activeModelConfig.value.split(':');
  if (provider === 'deepseek') return model.includes('reasoner') ? 'DeepSeek-R1 (Reasoner)' : 'DeepSeek-V3';
  if (provider === 'groq') return model.includes('qwen') ? 'Groq (Qwen 3.6)' : 'Groq (GPT-OSS)';
  if (provider === 'openrouter') return 'OpenRouter';
  return 'Gemini Flash';
});

function saveActiveModel() {
  const [provider, model] = activeModelConfig.value.split(':');
  localStorage.setItem('ai_provider', provider);
  localStorage.setItem('ai_model', model);
  toast.success(`Active AI Coach switched to ${activeProviderBadge.value}`);
}

const geminiApiKey = ref(localStorage.getItem('gemini_api_key') || '');
const deepseekApiKey = ref(localStorage.getItem('deepseek_api_key') || '');
const groqApiKey = ref(localStorage.getItem('groq_api_key') || '');
const openrouterApiKey = ref(localStorage.getItem('openrouter_api_key') || '');

const isSavingKey = ref(false);
const isSavingDeepSeek = ref(false);
const isSavingGroq = ref(false);
const isSavingOpenRouter = ref(false);

// 1. Save Gemini Key
async function saveGeminiKey() {
  const trimmedKey = geminiApiKey.value.trim();
  if (!trimmedKey) {
    localStorage.removeItem('gemini_api_key');
    try {
      await supabase.from('families').update({ gemini_api_key: null }).eq('id', authStore.familyId);
      toast.success(localeStore.t('settings.apiKeyRemoved') || 'API Key removed.');
    } catch (e) {
      console.error('Failed to remove key from database:', e);
      toast.error('Failed to remove key from database.');
    }
    return;
  }

  isSavingKey.value = true;
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${trimmedKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: 'respond with ok' }] }]
        })
      }
    );

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error?.message || `API returned status ${response.status}`);
    }

    localStorage.setItem('gemini_api_key', trimmedKey);
    await supabase.from('families').update({ gemini_api_key: trimmedKey }).eq('id', authStore.familyId);
    toast.success(localeStore.t('settings.apiKeySaved') || 'Gemini API Key saved!');
  } catch (err) {
    console.error('Gemini verification failed:', err);
    toast.error(`Gemini verification failed: ${err.message || 'Invalid key.'}`);
  } finally {
    isSavingKey.value = false;
  }
}

// 2. Save DeepSeek Key
async function saveDeepSeekKey() {
  const trimmedKey = deepseekApiKey.value.trim();
  if (!trimmedKey) {
    localStorage.removeItem('deepseek_api_key');
    toast.success('DeepSeek API Key removed.');
    return;
  }

  isSavingDeepSeek.value = true;
  try {
    // Check balance or test chat completions
    const response = await fetch('https://api.deepseek.com/user/balance', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${trimmedKey}`,
        'Accept': 'application/json'
      }
    });

    const data = await response.json().catch(() => ({}));

    if (response.status === 401 || response.status === 403) {
      throw new Error('Authentication failed. Invalid DeepSeek API Key.');
    }

    // Always save the key if authenticated
    localStorage.setItem('deepseek_api_key', trimmedKey);

    if (data && data.is_available === false) {
      toast.warning('DeepSeek key saved! Notice: Account balance is 0. Please top up at platform.deepseek.com or use Groq/Gemini.');
    } else {
      toast.success('DeepSeek API Key verified & saved!');
    }
  } catch (err) {
    console.error('DeepSeek key verification error:', err);
    // Still allow saving if user confirms
    localStorage.setItem('deepseek_api_key', trimmedKey);
    toast.warning(`DeepSeek Key saved with notice: ${err.message}`);
  } finally {
    isSavingDeepSeek.value = false;
  }
}

// 3. Save Groq Key
async function saveGroqKey() {
  const trimmedKey = groqApiKey.value.trim();
  if (!trimmedKey) {
    localStorage.removeItem('groq_api_key');
    toast.success('Groq API Key removed.');
    return;
  }

  isSavingGroq.value = true;
  try {
    const response = await fetch('https://api.groq.com/openai/v1/models', {
      headers: {
        'Authorization': `Bearer ${trimmedKey}`
      }
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error?.message || `Groq returned status ${response.status}`);
    }

    localStorage.setItem('groq_api_key', trimmedKey);
    toast.success('Groq API Key verified & saved!');
  } catch (err) {
    console.error('Groq verification error:', err);
    toast.error(`Groq verification failed: ${err.message}`);
  } finally {
    isSavingGroq.value = false;
  }
}

// 4. Save OpenRouter Key
async function saveOpenRouterKey() {
  const trimmedKey = openrouterApiKey.value.trim();
  if (!trimmedKey) {
    localStorage.removeItem('openrouter_api_key');
    toast.success('OpenRouter API Key removed.');
    return;
  }

  isSavingOpenRouter.value = true;
  try {
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        'Authorization': `Bearer ${trimmedKey}`
      }
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error?.message || `OpenRouter returned status ${response.status}`);
    }

    localStorage.setItem('openrouter_api_key', trimmedKey);
    toast.success('OpenRouter API Key verified & saved!');
  } catch (err) {
    console.error('OpenRouter verification error:', err);
    toast.error(`OpenRouter verification failed: ${err.message}`);
  } finally {
    isSavingOpenRouter.value = false;
  }
}

async function changePassword() {
  if (form.value.password !== form.value.password_confirmation) {
    error.value = localeStore.currentLocale === 'id'
      ? 'Konfirmasi password baru tidak cocok.'
      : 'New password confirmation does not match.';
    return;
  }
  if (form.value.password.length < 8) {
    error.value = localeStore.currentLocale === 'id'
      ? 'Password minimal harus 8 karakter.'
      : 'Password must be at least 8 characters.';
    return;
  }
  loading.value = true;
  success.value = '';
  error.value = '';
  try {
    await authService.changePassword(form.value);
    success.value = localeStore.t('settings.passwordSuccess');
    form.value = { current_password: '', password: '', password_confirmation: '' };
  } catch (e) {
    error.value = e.message || e.response?.data?.message || 'Failed';
  } finally {
    loading.value = false;
  }
}

const whatsappGroupId = ref('');
const isSavingGroupId = ref(false);

onMounted(async () => {
  startAutoTour(settingsTourSteps);
  window.addEventListener('start-settings-tour', handleTour);

  if (authStore.familyId) {
    const { data, error } = await supabase.from('families').select('whatsapp_group_id').eq('id', authStore.familyId).single();
    if (data && data.whatsapp_group_id) {
      whatsappGroupId.value = data.whatsapp_group_id;
    }
  }
});

async function saveWhatsAppGroupId() {
  isSavingGroupId.value = true;
  try {
    const trimmedId = whatsappGroupId.value.trim();
    const { error } = await supabase.from('families').update({ whatsapp_group_id: trimmedId || null }).eq('id', authStore.familyId);
    if (error) throw error;
    toast.success('WhatsApp Group ID saved!');
  } catch (err) {
    console.error('Failed to save Group ID:', err);
    toast.error('Failed to save Group ID.');
  } finally {
    isSavingGroupId.value = false;
  }
}

onUnmounted(() => {
  window.removeEventListener('start-settings-tour', handleTour);
});
</script>
