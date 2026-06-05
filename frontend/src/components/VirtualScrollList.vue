<template>
  <div ref="container" class="virtual-scroll-container" @scroll="onScroll">
    <div :style="{ height: totalHeight + 'px', position: 'relative' }">
      <div
        :style="{ transform: `translateY(${offsetY}px)`, position: 'absolute', width: '100%' }"
      >
        <div v-for="item in visibleItems" :key="item.id" class="virtual-item">
          <slot :item="item"></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';

const props = defineProps({
  items: { type: Array, required: true },
  itemHeight: { type: Number, default: 50 },
  buffer: { type: Number, default: 5 },
});

const container = ref(null);
const scrollTop = ref(0);
const containerHeight = ref(400);

const totalHeight = computed(() => props.items.length * props.itemHeight);

const startIndex = computed(() => {
  return Math.max(0, Math.floor(scrollTop.value / props.itemHeight) - props.buffer);
});

const visibleCount = computed(() => {
  return Math.ceil(containerHeight.value / props.itemHeight) + 2 * props.buffer;
});

const visibleItems = computed(() => {
  return props.items.slice(startIndex.value, startIndex.value + visibleCount.value);
});

const offsetY = computed(() => startIndex.value * props.itemHeight);

function onScroll() {
  if (container.value) {
    scrollTop.value = container.value.scrollTop;
  }
}

onMounted(() => {
  nextTick(() => {
    if (container.value) {
      containerHeight.value = container.value.clientHeight || 400;
    }
  });
});
</script>

<style scoped>
.virtual-scroll-container {
  overflow-y: auto;
  height: 400px; /* default, can be overridden by parent */
  width: 100%;
}
.virtual-item {
  box-sizing: border-box;
}
</style>
