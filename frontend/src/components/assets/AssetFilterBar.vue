<template>
  <div class="asset-filter-bar mb-4">
    <!-- Category Pills Strip (Touch Scrollable on Mobile) -->
    <div class="category-pills-scroll d-flex gap-2 pb-2 mb-3">
      <button
        v-for="cat in categories"
        :key="cat.id"
        type="button"
        class="btn category-pill-btn d-flex align-items-center gap-2"
        :class="{ active: modelCategory === cat.id }"
        @click="selectCategory(cat.id)"
      >
        <i :class="cat.icon"></i>
        <span>{{ cat.label }}</span>
        <span v-if="cat.count !== undefined" class="badge rounded-pill pill-count-badge">
          {{ cat.count }}
        </span>
      </button>
    </div>

    <!-- Search & Filter Controls -->
    <div class="row g-2 align-items-center">
      <div class="col-12 col-md-5 col-lg-4">
        <div class="input-group">
          <span class="input-group-text bg-transparent border-end-0">
            <i class="bi bi-search text-muted"></i>
          </span>
          <input
            v-model="search"
            type="text"
            class="form-control border-start-0 ps-0"
            :placeholder="$t('assets.searchPlaceholder') || 'Cari aset, plat nomor, merk...'"
            @input="onSearchInput"
          />
          <button
            v-if="search"
            type="button"
            class="btn btn-outline-secondary border-start-0"
            @click="clearSearch"
          >
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
      </div>

      <div class="col-6 col-md-3 col-lg-2">
        <select
          v-model="selectedStatus"
          class="form-select"
          @change="onStatusChange"
        >
          <option value="all">{{ $t('assets.allStatuses') || 'Semua Status' }}</option>
          <option value="active">{{ $t('assets.statusActive') || 'Aktif Digunakan' }}</option>
          <option value="under_repair">{{ $t('assets.statusUnderRepair') || 'Dalam Perbaikan' }}</option>
          <option value="disposed">{{ $t('assets.statusDisposed') || 'Dibuang/Rusak' }}</option>
          <option value="sold">{{ $t('assets.statusSold') || 'Terjual' }}</option>
        </select>
      </div>

      <div class="col-6 col-md-4 col-lg-6 d-flex justify-content-end gap-2">
        <button
          type="button"
          class="btn btn-primary d-flex align-items-center gap-2 px-3 shadow-sm"
          @click="$emit('add-asset')"
        >
          <i class="bi bi-plus-circle"></i>
          <span class="d-none d-sm-inline">{{ $t('assets.addAsset') || 'Tambah Aset' }}</span>
          <span class="d-inline d-sm-none">{{ $t('common.add') || 'Tambah' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useLocaleStore } from '../../stores/locale';

const localeStore = useLocaleStore();
const t = (k) => localeStore.t(k);

const props = defineProps({
  category: {
    type: String,
    default: 'all',
  },
  status: {
    type: String,
    default: 'all',
  },
  searchQuery: {
    type: String,
    default: '',
  },
  countsByCategory: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits([
  'update:category',
  'update:status',
  'update:searchQuery',
  'add-asset',
]);

const modelCategory = computed(() => props.category);

const search = computed({
  get: () => props.searchQuery,
  set: (val) => emit('update:searchQuery', val),
});

const selectedStatus = computed({
  get: () => props.status,
  set: (val) => emit('update:status', val),
});

const categories = computed(() => [
  {
    id: 'all',
    label: t('assets.categories.all') || 'Semua Aset',
    icon: 'bi bi-grid-fill',
    count: props.countsByCategory.all,
  },
  {
    id: 'vehicle',
    label: t('assets.categories.vehicle') || 'Kendaraan',
    icon: 'bi bi-car-front-fill',
    count: props.countsByCategory.vehicle,
  },
  {
    id: 'appliance',
    label: t('assets.categories.appliance') || 'Peralatan Rumah',
    icon: 'bi bi-plug-fill',
    count: props.countsByCategory.appliance,
  },
  {
    id: 'electronics',
    label: t('assets.categories.electronics') || 'Elektronik & Gadget',
    icon: 'bi bi-laptop',
    count: props.countsByCategory.electronics,
  },
  {
    id: 'property',
    label: t('assets.categories.property') || 'Fasilitas & Properti',
    icon: 'bi bi-house-gear-fill',
    count: props.countsByCategory.property,
  },
  {
    id: 'furniture',
    label: t('assets.categories.furniture') || 'Furnitur & Interior',
    icon: 'bi bi-lamp-fill',
    count: props.countsByCategory.furniture,
  },
  {
    id: 'other',
    label: t('assets.categories.other') || 'Lainnya',
    icon: 'bi bi-box-seam-fill',
    count: props.countsByCategory.other,
  },
]);

function selectCategory(catId) {
  emit('update:category', catId);
}

function clearSearch() {
  emit('update:searchQuery', '');
}

function onSearchInput(e) {
  emit('update:searchQuery', e.target.value);
}

function onStatusChange(e) {
  emit('update:status', e.target.value);
}
</script>

<style scoped>
.category-pills-scroll {
  overflow-x: auto;
  white-space: nowrap;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
}

.category-pills-scroll::-webkit-scrollbar {
  height: 4px;
}

.category-pills-scroll::-webkit-scrollbar-thumb {
  background: rgba(100, 116, 139, 0.2);
  border-radius: 4px;
}

.category-pill-btn {
  background: var(--card-bg, rgba(255, 255, 255, 0.7));
  border: var(--card-border, 1px solid rgba(226, 232, 240, 0.8));
  color: var(--text-color, #1e293b);
  border-radius: 9999px;
  padding: 0.45rem 0.95rem;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.category-pill-btn:hover {
  background: rgba(102, 126, 234, 0.1);
  border-color: var(--primary-color, #667eea);
  color: var(--primary-color, #667eea);
}

.category-pill-btn.active {
  background: var(--primary-gradient, linear-gradient(135deg, #667eea 0%, #764ba2 100%));
  color: #ffffff;
  border-color: transparent;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.25);
}

.pill-count-badge {
  background: rgba(0, 0, 0, 0.12);
  font-size: 0.7rem;
  padding: 0.2rem 0.45rem;
}

.category-pill-btn.active .pill-count-badge {
  background: rgba(255, 255, 255, 0.25);
  color: #ffffff;
}
</style>
