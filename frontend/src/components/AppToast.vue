<template>
  <div class="toast-container position-fixed bottom-0 start-50 translate-middle-x p-4" style="z-index: 9999; margin-bottom: 20px;">
    <TransitionGroup name="toast-list">
      <div 
        v-for="toast in toastStore.toasts" 
        :key="toast.id" 
        class="custom-toast" 
        :class="`custom-toast-${toast.type}`"
        role="alert"
      >
        <div class="toast-icon">
          <i v-if="toast.type === 'success'" class="bi bi-check-lg"></i>
          <i v-else-if="toast.type === 'error'" class="bi bi-x-lg"></i>
          <i v-else-if="toast.type === 'warning'" class="bi bi-exclamation-triangle-fill"></i>
          <i v-else-if="toast.type === 'info'" class="bi bi-exclamation-lg"></i>
        </div>
        <div class="toast-message">{{ toast.message }}</div>
        <div class="toast-divider"></div>
        <button class="toast-close" @click="toastStore.remove(toast.id)">
          <i class="bi bi-x"></i>
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { useToastStore } from '../stores/toast';
const toastStore = useToastStore();
</script>

<style scoped>
.toast-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  pointer-events: none; /* Let clicks pass through container */
}

.custom-toast {
  display: flex;
  align-items: center;
  padding: 10px 14px;
  border-radius: 8px;
  min-width: 340px;
  max-width: 450px;
  border: 1px solid transparent;
  pointer-events: auto; /* Re-enable clicks for the toast body */
  box-shadow: 0 10px 25px rgba(0,0,0,0.05);
}

/* Success */
.custom-toast-success { border-color: #B7EB8F; background-color: #F6FFED; }
.custom-toast-success .toast-icon { background: #52C41A; color: white; }
.custom-toast-success .toast-message { color: #389E0D; }
.custom-toast-success .toast-divider { border-left-color: rgba(56, 158, 13, 0.2); }
.custom-toast-success .toast-close { color: #389E0D; }

/* Error */
.custom-toast-error { border-color: #FFCCC7; background-color: #FFF1F0; }
.custom-toast-error .toast-icon { background: #E84118; color: white; }
.custom-toast-error .toast-message { color: #CF1322; }
.custom-toast-error .toast-divider { border-left-color: rgba(207, 19, 34, 0.2); }
.custom-toast-error .toast-close { color: #CF1322; }

/* Warning */
.custom-toast-warning { border-color: #FFE58F; background-color: #FFFBE6; }
.custom-toast-warning .toast-icon { background: #FAAD14; color: white; }
.custom-toast-warning .toast-message { color: #D46B08; }
.custom-toast-warning .toast-divider { border-left-color: rgba(212, 107, 8, 0.2); }
.custom-toast-warning .toast-close { color: #D46B08; }

/* Info */
.custom-toast-info { border-color: #91D5FF; background-color: #E6F7FF; }
.custom-toast-info .toast-icon { background: #2747e8; color: white; }
.custom-toast-info .toast-message { color: #096DD9; }
.custom-toast-info .toast-divider { border-left-color: rgba(9, 109, 217, 0.2); }
.custom-toast-info .toast-close { color: #096DD9; }

.toast-icon {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  font-weight: bold;
  margin-right: 16px;
  flex-shrink: 0;
}

.toast-message {
  flex-grow: 1;
  font-size: 1.05rem;
  font-weight: 500;
  margin-right: 12px;
}

.toast-divider {
  border-left: 1px solid;
  height: 24px;
  margin-right: 12px;
}

.toast-close {
  background: none;
  border: none;
  font-size: 1.8rem;
  padding: 0;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}
.toast-close:hover {
  opacity: 1;
}

/* Animations */
.toast-list-enter-active,
.toast-list-leave-active {
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.toast-list-enter-from {
  opacity: 0;
  transform: translateY(50px) scale(0.9);
}
.toast-list-leave-to {
  opacity: 0;
  transform: translateY(50px) scale(0.9);
  position: absolute;
}
</style>
