<template>
  <div class="register-page d-flex align-items-center justify-content-center min-vh-100" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2rem 0;">
    <div class="card shadow-lg border-0 my-4" style="max-width: 460px; width: 100%; border-radius: 16px;">
      <div class="card-body p-4 p-md-5">
        <div class="text-center mb-4">
          <div class="mb-3">
            <i class="bi bi-wallet2 text-primary" style="font-size: 3rem;"></i>
          </div>
          <h3 class="fw-bold text-dark">Family Finance</h3>
          <p class="text-muted">Create a new family account</p>
        </div>

        <div v-if="error" class="alert alert-danger alert-dismissible fade show small" role="alert">
          {{ error }}
          <button type="button" class="btn-close" @click="error = ''"></button>
        </div>

        <form @submit.prevent="handleRegister">
          <div class="mb-3">
            <label class="form-label fw-semibold">Family Name</label>
            <div class="input-group">
              <span class="input-group-text"><i class="bi bi-people"></i></span>
              <input
                v-model="form.name"
                class="form-control"
                placeholder="Keluarga Surya"
                required
                autofocus
              />
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label fw-semibold">Email</label>
            <div class="input-group">
              <span class="input-group-text"><i class="bi bi-envelope"></i></span>
              <input
                v-model="form.email"
                type="email"
                class="form-control"
                placeholder="family@example.com"
                required
              />
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label fw-semibold">Password</label>
            <div class="input-group">
              <span class="input-group-text"><i class="bi bi-lock"></i></span>
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                class="form-control"
                placeholder="Minimum 8 characters"
                minlength="8"
                required
              />
              <button type="button" class="btn btn-outline-secondary" @click="showPassword = !showPassword">
                <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
              </button>
            </div>
          </div>

          <div class="mb-4">
            <label class="form-label fw-semibold">Confirm Password</label>
            <div class="input-group">
              <span class="input-group-text"><i class="bi bi-lock-fill"></i></span>
              <input
                v-model="form.password_confirmation"
                :type="showPassword ? 'text' : 'password'"
                class="form-control"
                placeholder="Repeat password"
                minlength="8"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            class="btn btn-primary-gradient w-100 py-2 fw-semibold"
            :disabled="loading"
          >
            <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
            {{ loading ? 'Creating account...' : 'Create Account' }}
          </button>
        </form>

        <p class="text-center text-muted mt-4 mb-0">
          Already have an account? <router-link to="/login" class="text-primary text-decoration-none fw-semibold">Sign in</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useToastStore } from '../stores/toast';

const router = useRouter();
const authStore = useAuthStore();
const toast = useToastStore();

const form = ref({ name: '', email: '', password: '', password_confirmation: '' });
const error = ref('');
const loading = ref(false);
const showPassword = ref(false);

async function handleRegister() {
  if (form.value.password !== form.value.password_confirmation) {
    error.value = 'Passwords do not match.';
    return;
  }

  loading.value = true;
  error.value = '';
  
  try {
    const payload = { ...form.value };
    await authStore.register(payload);
    
    toast.success('Registration successful. Welcome!');
    router.push('/');
    
  } catch (err) {
    if (err.response?.data?.errors) {
      const firstErrorKey = Object.keys(err.response.data.errors)[0];
      error.value = err.response.data.errors[firstErrorKey][0];
    } else {
      error.value = err.response?.data?.message || 'Registration failed. Please try again.';
    }
  } finally {
    loading.value = false;
  }
}
</script>
