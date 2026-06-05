<template>
  <div class="settings-page fade-in">
    <div class="page-header"><h4>Settings</h4><p>Manage your profile and preferences</p></div>
    <div class="row g-4">
      <div class="col-lg-6">
        <div class="stat-card">
          <h6 class="fw-bold mb-3"><i class="bi bi-person me-2"></i>Profile</h6>
          <div v-if="authStore.user">
            <div class="mb-2"><strong>Name:</strong> {{ authStore.user.name }}</div>
            <div class="mb-2"><strong>Email:</strong> {{ authStore.user.email }}</div>
          </div>
        </div>
      </div>
      <div class="col-lg-6">
        <div class="stat-card">
          <h6 class="fw-bold mb-3"><i class="bi bi-lock me-2"></i>Change Password</h6>
          <div v-if="success" class="alert alert-success small">{{ success }}</div>
          <div v-if="error" class="alert alert-danger small">{{ error }}</div>
          <form @submit.prevent="changePassword">
            <div class="mb-3"><label class="form-label">Current Password</label><input v-model="form.current_password" type="password" class="form-control" required /></div>
            <div class="mb-3"><label class="form-label">New Password</label><input v-model="form.password" type="password" class="form-control" minlength="8" required /></div>
            <div class="mb-3"><label class="form-label">Confirm Password</label><input v-model="form.password_confirmation" type="password" class="form-control" required /></div>
            <button type="submit" class="btn btn-primary-gradient" :disabled="loading">
              <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>Update Password
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
import { authService } from '../services/authService';
const authStore = useAuthStore();
const form = ref({ current_password: '', password: '', password_confirmation: '' });
const loading = ref(false);
const success = ref('');
const error = ref('');
async function changePassword() {
  loading.value = true; success.value = ''; error.value = '';
  try {
    await authService.changePassword(form.value);
    success.value = 'Password updated successfully!';
    form.value = { current_password: '', password: '', password_confirmation: '' };
  } catch(e) { error.value = e.response?.data?.message || 'Failed'; }
  finally { loading.value = false; }
}
</script>
