<template>
  <div class="icons-gem-page fade-in">
    <div class="page-header text-center mt-4">
      <h2 class="fw-bold text-gradient"><i class="bi bi-gem text-primary me-2"></i> Hidden Gem: Icon Library</h2>
      <p class="text-muted">Click any icon to copy its class name to your clipboard!</p>
      
      <div class="mx-auto mt-4" style="max-width: 400px;">
        <input v-model="search" type="text" class="form-control form-control-lg text-center shadow-sm" placeholder="Search icons (e.g., bank, food, car)..." />
      </div>
    </div>

    <div v-if="copied" class="alert alert-success text-center mx-auto mt-4 shadow-sm" style="max-width: 400px;">
      <i class="bi bi-check-circle-fill me-2"></i> Copied <strong>{{ copied }}</strong> to clipboard!
    </div>

    <div class="row g-3 mt-4">
      <div v-for="icon in filteredIcons" :key="icon" class="col-6 col-sm-4 col-md-3 col-lg-2">
        <div class="stat-card text-center cursor-pointer icon-card" @click="copyIcon(icon)">
          <div class="mb-2" style="font-size: 2rem; color: var(--primary-color);">
            <i :class="icon"></i>
          </div>
          <div class="small text-muted font-monospace">{{ icon }}</div>
        </div>
      </div>
      
      <div v-if="filteredIcons.length === 0" class="col-12 text-center text-muted py-5">
        No icons found matching "{{ search }}"
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const search = ref('');
const copied = ref('');

// A curated list of common/useful Bootstrap Icons for Finance Apps
const allIcons = [
  'bi-bank', 'bi-wallet', 'bi-wallet2', 'bi-cash', 'bi-cash-coin', 'bi-coin', 'bi-credit-card', 
  'bi-currency-dollar', 'bi-currency-euro', 'bi-currency-pound', 'bi-currency-yen', 'bi-currency-bitcoin',
  'bi-piggy-bank', 'bi-safe', 'bi-receipt', 'bi-cart', 'bi-cart-check', 'bi-basket', 'bi-bag',
  'bi-shop', 'bi-house', 'bi-house-door', 'bi-building', 'bi-car-front', 'bi-airplane', 'bi-bicycle',
  'bi-train-freight-front', 'bi-bus-front', 'bi-fuel-pump', 'bi-ev-station',
  'bi-cup-hot', 'bi-cup-straw', 'bi-egg-fried', 'bi-cake',
  'bi-controller', 'bi-dpad', 'bi-film', 'bi-music-note', 'bi-headphones', 'bi-ticket',
  'bi-heart-pulse', 'bi-bandaid', 'bi-hospital', 'bi-prescription', 
  'bi-book', 'bi-mortarboard', 'bi-laptop', 'bi-phone', 'bi-tv', 'bi-smartwatch',
  'bi-plug', 'bi-lightning-charge', 'bi-droplet', 'bi-fire', 'bi-wrench', 'bi-tools', 'bi-hammer',
  'bi-scissors', 'bi-brush', 'bi-palette', 'bi-camera', 'bi-gift', 'bi-balloon', 'bi-tree', 'bi-flower1',
  'bi-airplane-engines', 'bi-briefcase', 'bi-clipboard', 'bi-file-earmark-text', 'bi-gear', 'bi-shield-lock',
  'bi-person', 'bi-people', 'bi-person-workspace', 'bi-send', 'bi-envelope'
];

const filteredIcons = computed(() => {
  if (!search.value) return allIcons;
  const s = search.value.toLowerCase();
  return allIcons.filter(icon => icon.toLowerCase().includes(s));
});

function copyIcon(icon) {
  navigator.clipboard.writeText(icon);
  copied.value = icon;
  setTimeout(() => { copied.value = ''; }, 2000);
}
</script>

<style scoped>
.cursor-pointer { cursor: pointer; }
.icon-card { transition: all 0.2s ease; border: 2px solid transparent; }
.icon-card:hover { 
  transform: translateY(-5px); 
  box-shadow: 0 10px 20px rgba(0,0,0,0.1); 
  border-color: var(--primary-color); 
}
.text-gradient { 
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color)); 
  -webkit-background-clip: text; 
  -webkit-text-fill-color: transparent; 
}
</style>
