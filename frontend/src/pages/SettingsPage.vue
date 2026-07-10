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
              <button class="btn btn-primary-gradient" @click="saveGeminiKey" :disabled="isSavingKey">
                <span v-if="isSavingKey" class="spinner-border spinner-border-sm me-1"></span>
                {{ isSavingKey ? ($t('common.loading') || 'Checking...') : ($t('common.save') || 'Save') }}
              </button>
            </div>
            <div class="form-text small text-muted mt-2">
              Get a free API key from <a href="https://aistudio.google.com/" target="_blank" class="text-primary text-decoration-underline">Google AI Studio</a>. Stored locally in your browser.
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-6">
        <!-- WhatsApp Integration -->
        <div class="stat-card mb-4">
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
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useLocaleStore } from '../stores/locale';
import { useToastStore } from '../stores/toast';
import { authService } from '../services/authService';
import { supabase } from '../lib/supabase';

const authStore = useAuthStore();
const localeStore = useLocaleStore();
const toast = useToastStore();

const form = ref({ current_password: '', password: '', password_confirmation: '' });
const loading = ref(false);
const success = ref('');
const error = ref('');

const geminiApiKey = ref(localStorage.getItem('gemini_api_key') || '');

const isSavingKey = ref(false);

async function saveGeminiKey() {
  const trimmedKey = geminiApiKey.value.trim();
  if (!trimmedKey) {
    localStorage.removeItem('gemini_api_key');
    try {
      await supabase.from('families').update({ gemini_api_key: null }).eq('id', authStore.familyId);
      toast.success('API Key removed.');
    } catch (e) {
      console.error('Failed to remove key from database:', e);
      toast.error('Failed to remove key from database.');
    }
    return;
  }

  isSavingKey.value = true;
  try {
    // Perform a lightweight check request to verify the key is valid
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
    // Sync to database
    await supabase.from('families').update({ gemini_api_key: trimmedKey }).eq('id', authStore.familyId);
    toast.success(localeStore.t('common.success') || 'Settings saved successfully!');
  } catch (err) {
    console.error('Gemini verification failed:', err);
    toast.error(`Gemini verification failed: ${err.message || 'Invalid key or network issue.'}`);
  } finally {
    isSavingKey.value = false;
  }
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

const whatsappGroupId = ref('');
const isSavingGroupId = ref(false);

onMounted(async () => {
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
</script>
