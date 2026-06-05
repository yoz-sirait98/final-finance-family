<template>
  <div class="login-page d-flex align-items-center justify-content-center min-vh-100" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
    <div class="card shadow-lg border-0" style="max-width: 420px; width: 100%; border-radius: 16px;">
      <div class="card-body p-4 p-md-5">
        <div class="text-center mb-4">
          <div class="mb-3">
            <i class="bi bi-wallet2 text-primary" style="font-size: 3rem;"></i>
          </div>
          <h3 class="fw-bold text-dark">Family Finance</h3>
          <p class="text-muted">Sign in to manage your family finances</p>
        </div>

        <div v-if="error" class="alert alert-danger alert-dismissible fade show" role="alert">
          {{ error }}
          <button type="button" class="btn-close" @click="error = ''"></button>
        </div>

        <form @submit.prevent="handleLogin">
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
                autofocus
              />
            </div>
          </div>

          <div class="mb-4">
            <label class="form-label fw-semibold">Password</label>
            <div class="input-group">
              <span class="input-group-text"><i class="bi bi-lock"></i></span>
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                class="form-control"
                placeholder="Enter password"
                required
              />
              <button type="button" class="btn btn-outline-secondary" @click="showPassword = !showPassword">
                <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
              </button>
            </div>
          </div>

          <button
            type="submit"
            class="btn btn-primary-gradient w-100 py-2 fw-semibold"
            :disabled="loading"
          >
            <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
            {{ loading ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>

        <p class="text-center text-muted mt-4 mb-0">
          New here? <router-link to="/register" class="text-primary text-decoration-none fw-semibold">Create an account</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const form = ref({ email: '', password: '' });
const error = ref('');
const loading = ref(false);
const showPassword = ref(false);

async function handleLogin() {
  loading.value = true;
  error.value = '';
  try {
    await authStore.login(form.value);
    router.push('/');
  } catch (err) {
    error.value = err.response?.data?.message || 'Login failed. Please check your credentials.';
  } finally {
    loading.value = false;
  }
}
</script>
