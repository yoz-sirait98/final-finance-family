<template>
  <div class="login-page d-flex align-items-center justify-content-center min-vh-100 position-relative" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
    <!-- Floating Language Switcher -->
    <div class="position-absolute top-0 end-0 p-3">
      <div class="btn-group shadow-sm" style="border-radius: 20px; overflow: hidden; background: rgba(255, 255, 255, 0.15); backdrop-filter: blur(10px); padding: 2px;">
        <button
          type="button"
          class="btn btn-xs py-1 px-3 border-0 fw-semibold text-white"
          :style="localeStore.currentLocale === 'en' ? 'background: rgba(255,255,255,0.3); border-radius: 18px;' : 'background: transparent;'"
          @click="localeStore.setLocale('en')"
        >EN</button>
        <button
          type="button"
          class="btn btn-xs py-1 px-3 border-0 fw-semibold text-white"
          :style="localeStore.currentLocale === 'id' ? 'background: rgba(255,255,255,0.3); border-radius: 18px;' : 'background: transparent;'"
          @click="localeStore.setLocale('id')"
        >ID</button>
      </div>
    </div>

    <div class="card shadow-lg border-0" style="max-width: 420px; width: 100%; border-radius: 16px;">
      <div class="card-body p-4 p-md-5">
        <div class="text-center mb-4">
          <div class="mb-3">
            <i class="bi bi-wallet2 text-primary" style="font-size: 3rem;"></i>
          </div>
          <h3 class="fw-bold text-dark">{{ $t('nav.brand') }}</h3>
          <p class="text-muted">{{ $t('auth.login.subtitle') }}</p>
        </div>

        <div v-if="error" class="alert alert-danger alert-dismissible fade show" role="alert">
          {{ error }}
          <button type="button" class="btn-close" @click="error = ''"></button>
        </div>

        <form @submit.prevent="handleLogin">
          <div class="mb-3">
            <label class="form-label fw-semibold" for="loginEmail">{{ $t('auth.login.email') }}</label>
            <div class="input-group">
              <span class="input-group-text"><i class="bi bi-envelope"></i></span>
              <input
                id="loginEmail"
                name="email"
                v-model="form.email"
                type="email"
                class="form-control"
                :placeholder="$t('auth.login.emailPlaceholder')"
                required
                autofocus
                autocomplete="username"
              />
            </div>
          </div>

          <div class="mb-4">
            <label class="form-label fw-semibold" for="loginPassword">{{ $t('auth.login.password') }}</label>
            <div class="input-group">
              <span class="input-group-text"><i class="bi bi-lock"></i></span>
              <input
                id="loginPassword"
                name="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                class="form-control"
                :placeholder="$t('auth.login.passwordPlaceholder')"
                required
                autocomplete="current-password"
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
            {{ loading ? $t('auth.login.signingIn') : $t('auth.login.signIn') }}
          </button>
        </form>

        <p class="text-center text-muted mt-4 mb-0">
          {{ $t('auth.login.newHere') }} <router-link to="/register" class="text-primary text-decoration-none fw-semibold">{{ $t('auth.login.createAccount') }}</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useLocaleStore } from '../stores/locale';

const router = useRouter();
const authStore = useAuthStore();
const localeStore = useLocaleStore();

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
    error.value = err.response?.data?.message || localeStore.t('auth.login.failed');
  } finally {
    loading.value = false;
  }
}
</script>
