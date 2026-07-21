<template>
  <div class="install-pwa-wrapper" v-if="showInstallPrompt">
    <!-- iOS Instructions Modal -->
    <div v-if="showIosModal" class="vue-modal-backdrop" style="z-index: 9999;" @mousedown.self="showIosModal = false">
      <div class="vue-modal" style="max-width: 400px;">
        <div class="modal-header border-0 pb-0">
          <h5 class="modal-title fw-bold"><i class="bi bi-apple me-2 text-dark"></i>Install on iPhone</h5>
          <button type="button" class="btn-close" @click="showIosModal = false"></button>
        </div>
        <div class="modal-body text-center py-4">
          <div class="bg-light p-3 rounded mb-3 shadow-sm border">
            <p class="mb-3 fw-bold text-dark">To install FamFin on your iPhone for the best full-screen native experience:</p>
            <ol class="text-start mb-0" style="display: inline-block; text-align: left;">
              <li class="mb-3">Tap the <strong>Share</strong> button <i class="bi bi-box-arrow-up mx-1 border bg-white rounded p-1 text-primary"></i> at the very bottom of Safari.</li>
              <li>Scroll down the list and tap <strong>Add to Home Screen</strong> <i class="bi bi-plus-square mx-1 border bg-white rounded p-1 text-dark"></i>.</li>
            </ol>
          </div>
        </div>
        <div class="modal-footer border-0 pt-0">
          <button class="btn btn-primary-gradient w-100" @click="showIosModal = false">Got it!</button>
        </div>
      </div>
    </div>

    <!-- The actual Install Button -->
    <button 
      class="btn btn-sm btn-primary-gradient d-flex align-items-center gap-1 install-btn"
      @click="handleInstallClick"
      title="Install FamFin App"
    >
      <i class="bi bi-download"></i>
      <span class="d-none d-md-inline fw-bold">Install App</span>
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const showInstallPrompt = ref(false);
const showIosModal = ref(false);
let deferredPrompt = null;

const isIos = () => {
  const userAgent = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent);
};

const isStandalone = () => {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
};

function handleInstallClick() {
  if (isIos()) {
    showIosModal.value = true;
  } else if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
        showInstallPrompt.value = false;
      }
      deferredPrompt = null;
    });
  }
}

function handleBeforeInstallPrompt(e) {
  // Prevent Chrome from automatically showing the prompt
  e.preventDefault();
  // Stash the event so it can be triggered later.
  deferredPrompt = e;
  // Update UI to notify the user they can add to home screen
  showInstallPrompt.value = true;
}

onMounted(() => {
  if (isStandalone()) {
    showInstallPrompt.value = false;
    return;
  }

  if (isIos()) {
    // iOS doesn't fire beforeinstallprompt, so just show the button instructions
    showInstallPrompt.value = true;
  } else {
    // Listen for the beforeinstallprompt event on Android/Desktop
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }
});

onUnmounted(() => {
  window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
});
</script>

<style scoped>
.install-btn {
  animation: pulse-glow 2s infinite;
  box-shadow: 0 4px 10px rgba(102, 126, 234, 0.3);
}

@keyframes pulse-glow {
  0% { box-shadow: 0 0 0 0 rgba(102, 126, 234, 0.4); }
  70% { box-shadow: 0 0 0 6px rgba(102, 126, 234, 0); }
  100% { box-shadow: 0 0 0 0 rgba(102, 126, 234, 0); }
}
</style>
