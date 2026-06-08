<template>
  <div class="register-page d-flex align-items-center justify-content-center min-vh-100 position-relative" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2rem 0;">
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

    <div class="card shadow-lg border-0 my-4" style="max-width: 460px; width: 100%; border-radius: 16px;">
      <div class="card-body p-4 p-md-5">
        <div class="text-center mb-4">
          <div class="mb-3">
            <i class="bi bi-wallet2 text-primary" style="font-size: 3rem;"></i>
          </div>
          <h3 class="fw-bold text-dark">{{ $t('nav.brand') }}</h3>
          <p class="text-muted">{{ $t('auth.register.subtitle') }}</p>
        </div>

        <div v-if="error" class="alert alert-danger alert-dismissible fade show small" role="alert">
          {{ error }}
          <button type="button" class="btn-close" @click="error = ''"></button>
        </div>

        <form @submit.prevent="handleRegister">
          <div class="mb-3">
            <label class="form-label fw-semibold" for="regName">{{ $t('auth.register.familyName') }}</label>
            <div class="input-group">
              <span class="input-group-text"><i class="bi bi-people"></i></span>
              <input
                id="regName"
                name="name"
                v-model="form.name"
                class="form-control"
                :placeholder="$t('auth.register.familyNamePlaceholder')"
                required
                autofocus
                autocomplete="organization"
              />
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label fw-semibold" for="regEmail">{{ $t('auth.register.email') }}</label>
            <div class="input-group">
              <span class="input-group-text"><i class="bi bi-envelope"></i></span>
              <input
                id="regEmail"
                name="email"
                v-model="form.email"
                type="email"
                class="form-control"
                :placeholder="$t('auth.register.emailPlaceholder')"
                required
                autocomplete="email"
              />
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label fw-semibold" for="regPassword">{{ $t('auth.register.password') }}</label>
            <div class="input-group">
              <span class="input-group-text"><i class="bi bi-lock"></i></span>
              <input
                id="regPassword"
                name="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                class="form-control"
                :placeholder="$t('auth.register.passwordPlaceholder')"
                minlength="8"
                required
                autocomplete="new-password"
              />
              <button type="button" class="btn btn-outline-secondary" @click="showPassword = !showPassword">
                <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
              </button>
            </div>
          </div>

          <div class="mb-4">
            <label class="form-label fw-semibold" for="regPasswordConfirm">{{ $t('auth.register.confirmPassword') }}</label>
            <div class="input-group">
              <span class="input-group-text"><i class="bi bi-lock-fill"></i></span>
              <input
                id="regPasswordConfirm"
                name="password_confirmation"
                v-model="form.password_confirmation"
                :type="showPassword ? 'text' : 'password'"
                class="form-control"
                :placeholder="$t('auth.register.confirmPasswordPlaceholder')"
                minlength="8"
                required
                autocomplete="new-password"
              />
            </div>
          </div>

          <button
            type="submit"
            class="btn btn-primary-gradient w-100 py-2 fw-semibold"
            :disabled="loading"
          >
            <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
            {{ loading ? $t('auth.register.creatingAccount') : $t('auth.register.createAccount') }}
          </button>
        </form>

        <p class="text-center text-muted mt-4 mb-0">
          {{ $t('auth.register.alreadyHaveAccount') }} <router-link to="/login" class="text-primary text-decoration-none fw-semibold">{{ $t('auth.register.signIn') }}</router-link>
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
import { useLocaleStore } from '../stores/locale';

const router = useRouter();
const authStore = useAuthStore();
const toast = useToastStore();
const localeStore = useLocaleStore();

const form = ref({ name: '', email: '', password: '', password_confirmation: '' });
const error = ref('');
const loading = ref(false);
const showPassword = ref(false);

async function handleRegister() {
  if (form.value.password !== form.value.password_confirmation) {
    error.value = localeStore.t('auth.register.passwordMismatch');
    return;
  }

  loading.value = true;
  error.value = '';
  
  try {
    const payload = { ...form.value };
    await authStore.register(payload);
    
    toast.success(localeStore.t('auth.register.success'));
    router.push('/');
    
  } catch (err) {
    if (err.response?.data?.errors) {
      const firstErrorKey = Object.keys(err.response.data.errors)[0];
      error.value = err.response.data.errors[firstErrorKey][0];
    } else {
      error.value = err.response?.data?.message || localeStore.t('auth.register.failed');
    }
  } finally {
    loading.value = false;
  }
}
</script>
