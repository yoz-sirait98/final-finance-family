<template>
  <div class="settings-page fade-in">
    <div class="page-header">
      <h4>{{ $t('settings.title') }}</h4>
      <p>{{ $t('settings.subtitle') }}</p>
    </div>
    <div class="row g-4">
      <div class="col-lg-6">
        <!-- Profile info -->
        <div class="stat-card mb-4">
          <h6 class="fw-bold mb-3"><i class="bi bi-person me-2"></i>{{ $t('settings.profile') }}</h6>
          <div v-if="authStore.user">
            <div class="mb-2"><strong>{{ $t('common.name') }}:</strong> {{ authStore.userName }}</div>
            <div class="mb-2"><strong>{{ $t('auth.login.email') }}:</strong> {{ authStore.session?.user?.email }}</div>
          </div>
        </div>

        <!-- Language Preference -->
        <div class="stat-card mb-4">
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

        <!-- AI Configuration -->
        <div class="stat-card">
          <h6 class="fw-bold mb-3"><i class="bi bi-stars me-2"></i>{{ $t('settings.aiConfig') || 'AI Configuration' }}</h6>
          <div class="mb-3">
            <label class="form-label">{{ $t('settings.geminiApiKey') || 'Gemini API Key' }}</label>
            <div class="input-group">
              <input
                v-model="geminiApiKey"
                type="password"
                class="form-control"
                placeholder="AIzaSy..."
              />
              <button class="btn btn-primary-gradient" @click="saveGeminiKey">
                {{ $t('common.save') || 'Save' }}
              </button>
            </div>
            <div class="form-text small text-muted mt-2">
              Get a free API key from <a href="https://aistudio.google.com/" target="_blank" class="text-primary text-decoration-underline">Google AI Studio</a>. Stored locally in your browser.
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-6">
        <!-- Change Password -->
        <div class="stat-card h-100">
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
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useLocaleStore } from '../stores/locale';
import { useToastStore } from '../stores/toast';
import { authService } from '../services/authService';

const authStore = useAuthStore();
const localeStore = useLocaleStore();
const toast = useToastStore();

const form = ref({ current_password: '', password: '', password_confirmation: '' });
const loading = ref(false);
const success = ref('');
const error = ref('');

const geminiApiKey = ref(localStorage.getItem('gemini_api_key') || '');

function saveGeminiKey() {
  localStorage.setItem('gemini_api_key', geminiApiKey.value.trim());
  toast.success(localeStore.t('common.success') || 'Settings saved successfully!');
}

async function changePassword() {
  loading.value = true;
  success.value = '';
  error.value = '';
  try {
    await authService.changePassword(form.value);
    success.value = localeStore.t('settings.passwordSuccess');
    form.value = { current_password: '', password: '', password_confirmation: '' };
  } catch (e) {
    error.value = e.response?.data?.message || 'Failed';
  } finally {
    loading.value = false;
  }
}
</script>
