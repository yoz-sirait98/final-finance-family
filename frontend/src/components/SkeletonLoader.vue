<template>
  <div class="skeleton-wrapper w-100">
    <!-- If we want to simulate a table row -->
    <div v-if="type === 'table-row'" class="d-flex align-items-center py-3 border-bottom border-secondary border-opacity-10">
      <div class="skeleton-box rounded-circle me-3" style="width: 40px; height: 40px;"></div>
      <div class="flex-grow-1">
        <div class="skeleton-box rounded mb-2" style="width: 40%; height: 16px;"></div>
        <div class="skeleton-box rounded" style="width: 25%; height: 12px;"></div>
      </div>
      <div class="skeleton-box rounded" style="width: 80px; height: 24px;"></div>
    </div>
    
    <!-- Generic block -->
    <div v-else class="skeleton-box rounded w-100" :style="{ height: height || '20px' }"></div>
  </div>
</template>

<script setup>
defineProps({
  type: {
    type: String,
    default: 'block'
  },
  height: {
    type: String,
    default: '20px'
  }
});
</script>

<style scoped>
.skeleton-box {
  background: linear-gradient(
    90deg,
    rgba(200, 200, 200, 0.1) 25%,
    rgba(200, 200, 200, 0.2) 50%,
    rgba(200, 200, 200, 0.1) 75%
  );
  background-size: 200% 100%;
  animation: pulseSkeleton 1.5s infinite ease-in-out;
}

[data-theme="dark"] .skeleton-box {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.03) 25%,
    rgba(255, 255, 255, 0.08) 50%,
    rgba(255, 255, 255, 0.03) 75%
  );
  background-size: 200% 100%;
}

@keyframes pulseSkeleton {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
