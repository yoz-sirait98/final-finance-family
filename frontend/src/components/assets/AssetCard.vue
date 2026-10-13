<template>
  <div class="asset-card card h-100 shadow-sm transition-all" @click="$emit('view', asset)">
    <!-- Card Media / Header Banner -->
    <div class="asset-card-media position-relative">
      <img
        v-if="resolvedImageUrl"
        :src="resolvedImageUrl"
        :alt="asset.name"
        class="asset-image w-100 object-fit-cover"
        @error="onImageError"
      />
      <div v-else class="asset-placeholder-banner d-flex align-items-center justify-content-center" :class="categoryThemeClass">
        <i :class="categoryIcon" class="display-5 text-white opacity-75"></i>
      </div>

      <!-- Category & Status Badges Overlay -->
      <div class="position-absolute top-0 start-0 m-2">
        <span class="badge rounded-pill asset-category-badge shadow-sm" :class="categoryThemeClass">
          <i :class="categoryIcon" class="me-1"></i>
          {{ categoryLabel }}
        </span>
      </div>

      <div class="position-absolute top-0 end-0 m-2">
        <span class="badge rounded-pill asset-status-badge shadow-sm" :class="statusBadgeClass">
          {{ statusLabel }}
        </span>
      </div>
    </div>

    <!-- Card Body -->
    <div class="card-body d-flex flex-column p-3">
      <!-- Title & Brand -->
      <div class="mb-2">
        <h6 class="card-title fw-bold mb-1 text-truncate" :title="asset.name">
          {{ asset.name }}
        </h6>
        <div class="text-muted small text-truncate">
          <span v-if="asset.brand" class="fw-medium text-body">{{ asset.brand }}</span>
          <span v-if="asset.brand && asset.model"> • </span>
          <span v-if="asset.model">{{ asset.model }}</span>
        </div>
      </div>

      <!-- Vehicle Spec Chips (License plate & Odometer) -->
      <div v-if="asset.category === 'vehicle'" class="d-flex align-items-center gap-2 mb-2 flex-wrap">
        <span v-if="asset.license_plate" class="plate-badge">
          <i class="bi bi-card-heading me-1"></i>
          {{ asset.license_plate }}
        </span>
        <span v-if="asset.current_odometer" class="spec-badge">
          <i class="bi bi-speedometer2 me-1"></i>
          {{ Number(asset.current_odometer).toLocaleString('id-ID') }} km
        </span>
      </div>

      <!-- Location & Member Custodian -->
      <div class="d-flex align-items-center justify-content-between text-muted small mb-3 flex-wrap gap-1">
        <span v-if="asset.location" class="d-flex align-items-center gap-1">
          <i class="bi bi-geo-alt text-primary"></i>
          <span>{{ asset.location }}</span>
        </span>
        <span v-if="asset.member" class="d-flex align-items-center gap-1 ms-auto">
          <i class="bi bi-person-circle text-secondary"></i>
          <span>{{ asset.member.name }}</span>
        </span>
      </div>

      <!-- Financial Value -->
      <div class="asset-valuation-box mt-auto p-2 rounded mb-3">
        <div class="d-flex justify-content-between align-items-center">
          <span class="text-muted small">{{ $t('assets.estimatedValue') || 'Estimasi Nilai' }}:</span>
          <span class="fw-bold text-success">
            Rp {{ formattedValuation }}
          </span>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="d-flex align-items-center justify-content-between pt-2 border-top gap-2" @click.stop>
        <button
          type="button"
          class="btn btn-sm btn-outline-primary flex-grow-1 d-flex align-items-center justify-content-center gap-1"
          @click="$emit('view', asset)"
        >
          <i class="bi bi-info-circle"></i>
          <span>{{ $t('assets.details') || 'Detail' }}</span>
        </button>

        <button
          type="button"
          class="btn btn-sm btn-outline-success flex-grow-1 d-flex align-items-center justify-content-center gap-1"
          @click="$emit('log-service', asset)"
        >
          <i class="bi bi-tools"></i>
          <span>{{ $t('assets.logService') || 'Servis' }}</span>
        </button>

        <div class="dropdown">
          <button
            class="btn btn-sm btn-light border dropdown-toggle no-caret"
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <i class="bi bi-three-dots-vertical"></i>
          </button>
          <ul class="dropdown-menu dropdown-menu-end shadow-sm">
            <li>
              <a class="dropdown-item d-flex align-items-center gap-2" href="#" @click.prevent="$emit('edit', asset)">
                <i class="bi bi-pencil text-primary"></i>
                <span>{{ $t('common.edit') || 'Ubah' }}</span>
              </a>
            </li>
            <li>
              <a class="dropdown-item d-flex align-items-center gap-2" href="#" @click.prevent="$emit('add-schedule', asset)">
                <i class="bi bi-calendar-plus text-info"></i>
                <span>{{ $t('assets.addSchedule') || 'Atur Jadwal Servis' }}</span>
              </a>
            </li>
            <li>
              <a class="dropdown-item d-flex align-items-center gap-2" href="#" @click.prevent="$emit('add-warranty', asset)">
                <i class="bi bi-shield-plus text-warning"></i>
                <span>{{ $t('assets.addWarranty') || 'Tambah Garansi' }}</span>
              </a>
            </li>
            <li><hr class="dropdown-divider" /></li>
            <li>
              <a class="dropdown-item d-flex align-items-center gap-2 text-danger" href="#" @click.prevent="$emit('delete', asset)">
                <i class="bi bi-trash"></i>
                <span>{{ $t('common.delete') || 'Hapus' }}</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useLocaleStore } from '../../stores/locale';
import { getReceiptSignedUrl } from '../../services/storageService';

const localeStore = useLocaleStore();
const t = (k) => localeStore.t(k);

const props = defineProps({
  asset: {
    type: Object,
    required: true,
  },
});

defineEmits(['view', 'edit', 'delete', 'log-service', 'add-schedule', 'add-warranty']);

const imageFailed = ref(false);
const resolvedImageUrl = ref(null);

async function resolveImage() {
  imageFailed.value = false;
  if (!props.asset.image_url) {
    resolvedImageUrl.value = null;
    return;
  }
  if (props.asset.image_url.startsWith('http://') || props.asset.image_url.startsWith('https://')) {
    resolvedImageUrl.value = props.asset.image_url;
  } else {
    try {
      resolvedImageUrl.value = await getReceiptSignedUrl(props.asset.image_url);
    } catch {
      resolvedImageUrl.value = null;
    }
  }
}

watch(() => props.asset.image_url, resolveImage);
onMounted(resolveImage);

function onImageError() {
  imageFailed.value = true;
  resolvedImageUrl.value = null;
}

const categoryThemeClass = computed(() => {
  switch (props.asset.category) {
    case 'vehicle':
      return 'bg-gradient-indigo';
    case 'appliance':
      return 'bg-gradient-teal';
    case 'electronics':
      return 'bg-gradient-blue';
    case 'property':
      return 'bg-gradient-orange';
    case 'furniture':
      return 'bg-gradient-amber';
    default:
      return 'bg-gradient-slate';
  }
});

const categoryIcon = computed(() => {
  switch (props.asset.category) {
    case 'vehicle':
      return 'bi bi-car-front-fill';
    case 'appliance':
      return 'bi bi-plug-fill';
    case 'electronics':
      return 'bi bi-laptop';
    case 'property':
      return 'bi bi-house-gear-fill';
    case 'furniture':
      return 'bi bi-lamp-fill';
    default:
      return 'bi bi-box-seam-fill';
  }
});

const categoryLabel = computed(() => {
  const cat = props.asset.category;
  return t(`assets.categories.${cat}`) || cat;
});

const statusBadgeClass = computed(() => {
  switch (props.asset.status) {
    case 'active':
      return 'bg-success text-white';
    case 'under_repair':
      return 'bg-warning text-dark';
    case 'disposed':
      return 'bg-secondary text-white';
    case 'sold':
      return 'bg-info text-dark';
    default:
      return 'bg-light text-dark';
  }
});

const statusLabel = computed(() => {
  switch (props.asset.status) {
    case 'active':
      return t('assets.statusActive') || 'Aktif';
    case 'under_repair':
      return t('assets.statusUnderRepair') || 'Servis';
    case 'disposed':
      return t('assets.statusDisposed') || 'Rusak';
    case 'sold':
      return t('assets.statusSold') || 'Terjual';
    default:
      return props.asset.status;
  }
});

const formattedValuation = computed(() => {
  const val = Number(
    props.asset.current_value !== null && props.asset.current_value !== undefined
      ? props.asset.current_value
      : props.asset.purchase_price || 0
  );
  return val.toLocaleString('id-ID');
});
</script>

<style scoped>
.asset-card {
  cursor: pointer;
  border-radius: 14px;
  overflow: hidden;
  border: var(--card-border, 1px solid rgba(226, 232, 240, 0.8));
  background: var(--card-bg, rgba(255, 255, 255, 0.7));
  backdrop-filter: blur(12px);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.asset-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--card-shadow-hover, 0 12px 30px rgba(0, 0, 0, 0.08)) !important;
}

.asset-card-media {
  height: 140px;
  overflow: hidden;
  background-color: #f1f5f9;
}

.asset-image {
  height: 140px;
  transition: transform 0.3s ease;
}

.asset-card:hover .asset-image {
  transform: scale(1.05);
}

.asset-placeholder-banner {
  height: 140px;
}

.bg-gradient-indigo {
  background: linear-gradient(135deg, #6366f1 0%, #4338ca 100%);
  color: white;
}

.bg-gradient-teal {
  background: linear-gradient(135deg, #0d9488 0%, #115e59 100%);
  color: white;
}

.bg-gradient-blue {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
}

.bg-gradient-orange {
  background: linear-gradient(135deg, #f97316 0%, #c2410c 100%);
  color: white;
}

.bg-gradient-amber {
  background: linear-gradient(135deg, #f59e0b 0%, #b45309 100%);
  color: white;
}

.bg-gradient-slate {
  background: linear-gradient(135deg, #64748b 0%, #334155 100%);
  color: white;
}

.plate-badge {
  background: #0f172a;
  color: #f8fafc;
  padding: 0.15rem 0.5rem;
  border-radius: 6px;
  font-family: monospace;
  font-weight: 700;
  font-size: 0.75rem;
  letter-spacing: 0.5px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.spec-badge {
  background: rgba(100, 116, 139, 0.1);
  color: var(--text-color, #1e293b);
  padding: 0.15rem 0.5rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
}

.asset-valuation-box {
  background: rgba(0, 0, 0, 0.03);
  border: 1px dashed rgba(100, 116, 139, 0.2);
}

[data-theme="dark"] .asset-valuation-box {
  background: rgba(255, 255, 255, 0.03);
}

.no-caret::after {
  display: none;
}
</style>
