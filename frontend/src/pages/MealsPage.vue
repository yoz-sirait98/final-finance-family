<template>
  <div class="meals-page-container">
    <!-- Hero Header -->
    <div class="meals-hero mb-4 p-4 rounded-4 position-relative overflow-hidden">
      <div class="row align-items-center g-3">
        <div class="col-12 col-lg-7">
          <div class="d-flex align-items-center gap-2 mb-2">
            <span class="badge rounded-pill bg-primary bg-opacity-20 text-primary fw-bold px-3 py-2">
              <i class="bi bi-egg-fried me-1"></i> {{ isId ? 'Dapur & Menu Keluarga' : 'Smart Meal & Pantry Hub' }}
            </span>
            <span v-if="pantryStore.expiringCount > 0" class="badge rounded-pill bg-warning text-dark px-2 py-1 pulse-badge">
              <i class="bi bi-exclamation-circle-fill me-1"></i> {{ pantryStore.expiringCount }} {{ isId ? 'perlu dimasak!' : 'expiring soon' }}
            </span>
          </div>
          <h2 class="fw-bold mb-2 text-gradient">
            {{ isId ? 'Menu Lezat & Kulkas Teratur' : 'Family Meals & Smart Pantry' }}
          </h2>
          <p class="text-muted mb-0">
            {{ isId ? 'Rencanakan menu harian, pantau stok kulkas, dan racik resep hemat anti mubazir dengan Chef AI.' : 'Plan family meals, track pantry freshness, and generate zero-waste recipes with AI.' }}
          </p>
        </div>

        <div class="col-12 col-lg-5 text-lg-end d-flex flex-wrap gap-2 justify-content-lg-end">
          <button
            type="button"
            class="btn btn-ai-sparkle d-flex align-items-center gap-2 px-3 py-2 fw-bold"
            @click="openAiRecipeModal"
          >
            <i class="bi bi-stars"></i>
            <span>{{ isId ? 'Masak dari Kulkas' : 'AI Recipe Chef' }}</span>
          </button>
          <button
            type="button"
            class="btn btn-primary d-flex align-items-center gap-2 px-3 py-2 fw-semibold"
            @click="openPantryModal()"
          >
            <i class="bi bi-plus-lg"></i>
            <span>{{ isId ? 'Bahan Dapur' : 'Add Item' }}</span>
          </button>
          <button
            type="button"
            class="btn btn-outline-primary d-flex align-items-center gap-2 px-3 py-2 fw-semibold"
            @click="openMealPlanModal()"
          >
            <i class="bi bi-calendar-plus"></i>
            <span>{{ isId ? 'Jadwalkan Menu' : 'Plan Meal' }}</span>
          </button>
        </div>
      </div>

      <!-- Quick Metrics Counters -->
      <div class="row g-2 mt-3 pt-3 border-top border-light-subtle">
        <div class="col-6 col-md-3">
          <div class="metric-card p-2 rounded-3 d-flex align-items-center gap-2" @click="activeTab = 'pantry'; pantryStore.setLocationFilter('fridge')">
            <div class="metric-icon fridge"><i class="bi bi-snow2"></i></div>
            <div>
              <div class="fw-bold fs-5 mb-0 leading-tight">{{ pantryStore.fridgeCount }}</div>
              <div class="text-muted xsmall">{{ isId ? 'Kulkas' : 'Fridge' }}</div>
            </div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="metric-card p-2 rounded-3 d-flex align-items-center gap-2" @click="activeTab = 'pantry'; pantryStore.setLocationFilter('freezer')">
            <div class="metric-icon freezer"><i class="bi bi-badge-vr-fill"></i></div>
            <div>
              <div class="fw-bold fs-5 mb-0 leading-tight">{{ pantryStore.freezerCount }}</div>
              <div class="text-muted xsmall">{{ isId ? 'Freezer' : 'Freezer' }}</div>
            </div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="metric-card p-2 rounded-3 d-flex align-items-center gap-2" @click="activeTab = 'pantry'; pantryStore.setLocationFilter('pantry')">
            <div class="metric-icon pantry"><i class="bi bi-box-seam-fill"></i></div>
            <div>
              <div class="fw-bold fs-5 mb-0 leading-tight">{{ pantryStore.pantryCount }}</div>
              <div class="text-muted xsmall">{{ isId ? 'Lemari Kering' : 'Pantry' }}</div>
            </div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div
            class="metric-card p-2 rounded-3 d-flex align-items-center gap-2"
            :class="{ 'border-warning bg-warning-subtle': pantryStore.expiringCount > 0 }"
            @click="openAiRecipeModal"
          >
            <div class="metric-icon expiring"><i class="bi bi-alarm-fill"></i></div>
            <div>
              <div class="fw-bold fs-5 mb-0 leading-tight">{{ pantryStore.expiringCount }}</div>
              <div class="text-muted xsmall">{{ isId ? 'Dekat Kadaluarsa' : 'Expiring Soon' }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Expiring Soon Notice Ribbon (if any) -->
    <div
      v-if="pantryStore.expiringSoonItems.length > 0"
      class="alert alert-warning border-0 shadow-sm rounded-4 p-3 mb-4 d-flex flex-wrap align-items-center justify-content-between gap-3 expiring-ribbon"
    >
      <div class="d-flex align-items-center gap-3">
        <div class="ribbon-icon">
          <i class="bi bi-exclamation-triangle-fill fs-4 text-warning"></i>
        </div>
        <div>
          <h6 class="fw-bold mb-1 text-dark">
            {{ isId ? 'Perhatian: Ada Bahan Makanan yang Segera Kedaluwarsa!' : 'Attention: Ingredients Expiring Soon!' }}
          </h6>
          <div class="d-flex flex-wrap gap-1 align-items-center">
            <span
              v-for="expItem in pantryStore.expiringSoonItems.slice(0, 4)"
              :key="expItem.id"
              class="badge bg-warning text-dark border border-warning-subtle"
            >
              {{ expItem.name }} ({{ expItem.quantity }} {{ expItem.unit }}) - {{ formatExpiryText(expItem.expiration_date) }}
            </span>
            <span v-if="pantryStore.expiringSoonItems.length > 4" class="badge bg-light text-muted">
              +{{ pantryStore.expiringSoonItems.length - 4 }} {{ isId ? 'lainnya' : 'more' }}
            </span>
          </div>
        </div>
      </div>

      <button
        type="button"
        class="btn btn-sm btn-dark px-3 py-2 rounded-pill fw-bold d-flex align-items-center gap-2"
        @click="openAiRecipeModal"
      >
        <i class="bi bi-magic text-warning"></i>
        <span>{{ isId ? 'Racik Menu Dari Bahan Ini' : 'Cook With These' }}</span>
      </button>
    </div>

    <!-- Navigation Tabs -->
    <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
      <ul class="nav nav-pills custom-nav-pills p-1 rounded-pill bg-body-tertiary border">
        <li class="nav-item">
          <button
            class="nav-link rounded-pill px-4 py-2 fw-semibold"
            :class="{ active: activeTab === 'planner' }"
            @click="activeTab = 'planner'"
          >
            <i class="bi bi-calendar3 me-1"></i>
            {{ isId ? 'Jadwal Menu Mingguan' : 'Weekly Meal Plan' }}
          </button>
        </li>
        <li class="nav-item">
          <button
            class="nav-link rounded-pill px-4 py-2 fw-semibold"
            :class="{ active: activeTab === 'pantry' }"
            @click="activeTab = 'pantry'"
          >
            <i class="bi bi-box-seam me-1"></i>
            {{ isId ? 'Stok Bahan Dapur' : 'Pantry & Fridge' }}
            <span class="badge rounded-pill bg-primary ms-1">{{ pantryStore.totalCount }}</span>
          </button>
        </li>
        <li class="nav-item">
          <button
            class="nav-link rounded-pill px-4 py-2 fw-semibold"
            :class="{ active: activeTab === 'recipes' }"
            @click="activeTab = 'recipes'"
          >
            <i class="bi bi-journal-bookmark me-1"></i>
            {{ isId ? 'Buku Resep' : 'Recipe Box' }}
            <span class="badge rounded-pill bg-secondary ms-1">{{ recipes.length }}</span>
          </button>
        </li>
      </ul>
    </div>

    <!-- ========================================================================= -->
    <!-- TAB 1: WEEKLY MEAL PLANNER -->
    <!-- ========================================================================= -->
    <div v-if="activeTab === 'planner'" class="tab-pane-fade">
      <!-- Week Navigation Toolbar -->
      <div class="planner-toolbar p-3 rounded-4 mb-3 d-flex flex-wrap align-items-center justify-content-between gap-3">
        <div class="d-flex align-items-center gap-2">
          <button
            type="button"
            class="btn btn-outline-secondary btn-sm rounded-circle nav-circle-btn"
            @click="prevWeek"
            title="Minggu Lalu"
          >
            <i class="bi bi-chevron-left"></i>
          </button>
          <div class="text-center px-2">
            <h5 class="fw-bold mb-0 text-nowrap">
              {{ formatWeekRange(mealPlanStore.startDateStr, mealPlanStore.endDateStr) }}
            </h5>
            <span class="text-muted xsmall">
              {{ isCurrentWeek ? (isId ? 'Minggu Berjalan' : 'Current Week') : '' }}
            </span>
          </div>
          <button
            type="button"
            class="btn btn-outline-secondary btn-sm rounded-circle nav-circle-btn"
            @click="nextWeek"
            title="Minggu Depan"
          >
            <i class="bi bi-chevron-right"></i>
          </button>
          <button
            v-if="!isCurrentWeek"
            type="button"
            class="btn btn-sm btn-outline-primary ms-2 rounded-pill px-3"
            @click="goToCurrentWeek"
          >
            {{ isId ? 'Minggu Ini' : 'Today' }}
          </button>
        </div>

        <div class="d-flex align-items-center gap-2 flex-wrap">
          <button
            type="button"
            class="btn btn-sm btn-outline-secondary rounded-pill px-3"
            @click="copyWeekNext"
            title="Salin rencana minggu ini ke minggu berikutnya"
          >
            <i class="bi bi-clipboard-plus me-1"></i>
            {{ isId ? 'Salin ke Minggu Depan' : 'Copy to Next Week' }}
          </button>
        </div>
      </div>

      <!-- 7-Day Matrix Grid -->
      <div class="week-matrix-grid">
        <div
          v-for="day in mealPlanStore.weekDaysMatrix"
          :key="day.dateStr"
          class="day-column rounded-4 p-3"
          :class="{ 'is-today': day.isToday }"
        >
          <!-- Day Header -->
          <div class="day-header d-flex justify-content-between align-items-center pb-2 mb-2 border-bottom">
            <div>
              <span class="day-name fw-bold" :class="{ 'text-primary': day.isToday }">
                {{ isId ? day.dayNameId : day.dayNameEn }}
              </span>
              <div class="day-date small text-muted">
                {{ day.dayNumber }} {{ day.monthName }}
              </div>
            </div>
            <div class="d-flex align-items-center gap-1">
              <span v-if="day.isToday" class="badge bg-primary rounded-pill xsmall px-2 py-1">
                {{ isId ? 'HARI INI' : 'TODAY' }}
              </span>
              <span v-else class="badge bg-secondary-subtle text-muted rounded-pill xsmall">
                {{ day.totalMeals }}
              </span>
            </div>
          </div>

          <!-- 4 Meal Slots -->
          <div class="slots-container d-flex flex-column gap-2">
            <!-- Sarapan / Breakfast -->
            <div class="slot-section">
              <div class="slot-label d-flex justify-content-between align-items-center mb-1">
                <span class="xsmall fw-bold text-muted text-uppercase">
                  <i class="bi bi-cup-hot text-warning me-1"></i>
                  {{ isId ? 'Sarapan' : 'Breakfast' }}
                </span>
                <button
                  type="button"
                  class="btn btn-link btn-sm p-0 text-decoration-none add-dish-btn"
                  @click="openMealPlanModal(null, day.dateStr, 'breakfast')"
                  title="Tambah Menu"
                >
                  <i class="bi bi-plus-circle"></i>
                </button>
              </div>
              <div class="meals-slot-list d-flex flex-column gap-1">
                <div
                  v-for="meal in day.meals.breakfast"
                  :key="meal.id"
                  class="meal-card p-2 rounded-3 border"
                  :class="{ 'completed-meal': meal.is_completed }"
                >
                  <div class="d-flex align-items-start justify-content-between gap-1">
                    <div class="form-check mb-0">
                      <input
                        class="form-check-input mt-1"
                        type="checkbox"
                        :checked="meal.is_completed"
                        @change="toggleMealCompleted(meal)"
                      />
                      <label
                        class="form-check-label fw-bold small meal-title cursor-pointer"
                        @click="openMealPlanModal(meal)"
                      >
                        {{ meal.recipe_title }}
                      </label>
                    </div>
                    <div class="dropdown">
                      <button class="btn btn-link btn-xs p-0 text-muted" type="button" @click="confirmDeleteMeal(meal)">
                        <i class="bi bi-x"></i>
                      </button>
                    </div>
                  </div>
                  <div class="d-flex align-items-center justify-content-between mt-1 pt-1 border-top border-light-subtle">
                    <span v-if="meal.assigned_member" class="cook-badge xsmall text-truncate" style="max-width: 110px;">
                      <i class="bi bi-person-fill me-1 text-danger"></i>{{ meal.assigned_member.name }}
                    </span>
                    <span v-else class="text-muted xsmall">—</span>
                    <button
                      v-if="meal.ingredients && meal.ingredients.length > 0"
                      type="button"
                      class="btn btn-link btn-xs p-0 text-warning text-decoration-none"
                      @click="exportMealToShopping(meal)"
                      title="Kirim bahan ke belanja"
                    >
                      <i class="bi bi-cart-plus"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Makan Siang / Lunch -->
            <div class="slot-section">
              <div class="slot-label d-flex justify-content-between align-items-center mb-1">
                <span class="xsmall fw-bold text-muted text-uppercase">
                  <i class="bi bi-sun text-success me-1"></i>
                  {{ isId ? 'Siang' : 'Lunch' }}
                </span>
                <button
                  type="button"
                  class="btn btn-link btn-sm p-0 text-decoration-none add-dish-btn"
                  @click="openMealPlanModal(null, day.dateStr, 'lunch')"
                  title="Tambah Menu"
                >
                  <i class="bi bi-plus-circle"></i>
                </button>
              </div>
              <div class="meals-slot-list d-flex flex-column gap-1">
                <div
                  v-for="meal in day.meals.lunch"
                  :key="meal.id"
                  class="meal-card p-2 rounded-3 border"
                  :class="{ 'completed-meal': meal.is_completed }"
                >
                  <div class="d-flex align-items-start justify-content-between gap-1">
                    <div class="form-check mb-0">
                      <input
                        class="form-check-input mt-1"
                        type="checkbox"
                        :checked="meal.is_completed"
                        @change="toggleMealCompleted(meal)"
                      />
                      <label
                        class="form-check-label fw-bold small meal-title cursor-pointer"
                        @click="openMealPlanModal(meal)"
                      >
                        {{ meal.recipe_title }}
                      </label>
                    </div>
                    <button class="btn btn-link btn-xs p-0 text-muted" type="button" @click="confirmDeleteMeal(meal)">
                      <i class="bi bi-x"></i>
                    </button>
                  </div>
                  <div class="d-flex align-items-center justify-content-between mt-1 pt-1 border-top border-light-subtle">
                    <span v-if="meal.assigned_member" class="cook-badge xsmall text-truncate" style="max-width: 110px;">
                      <i class="bi bi-person-fill me-1 text-danger"></i>{{ meal.assigned_member.name }}
                    </span>
                    <span v-else class="text-muted xsmall">—</span>
                    <button
                      v-if="meal.ingredients && meal.ingredients.length > 0"
                      type="button"
                      class="btn btn-link btn-xs p-0 text-warning text-decoration-none"
                      @click="exportMealToShopping(meal)"
                      title="Kirim bahan ke belanja"
                    >
                      <i class="bi bi-cart-plus"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Makan Malam / Dinner -->
            <div class="slot-section">
              <div class="slot-label d-flex justify-content-between align-items-center mb-1">
                <span class="xsmall fw-bold text-muted text-uppercase">
                  <i class="bi bi-moon-stars text-primary me-1"></i>
                  {{ isId ? 'Malam' : 'Dinner' }}
                </span>
                <button
                  type="button"
                  class="btn btn-link btn-sm p-0 text-decoration-none add-dish-btn"
                  @click="openMealPlanModal(null, day.dateStr, 'dinner')"
                  title="Tambah Menu"
                >
                  <i class="bi bi-plus-circle"></i>
                </button>
              </div>
              <div class="meals-slot-list d-flex flex-column gap-1">
                <div
                  v-for="meal in day.meals.dinner"
                  :key="meal.id"
                  class="meal-card p-2 rounded-3 border"
                  :class="{ 'completed-meal': meal.is_completed }"
                >
                  <div class="d-flex align-items-start justify-content-between gap-1">
                    <div class="form-check mb-0">
                      <input
                        class="form-check-input mt-1"
                        type="checkbox"
                        :checked="meal.is_completed"
                        @change="toggleMealCompleted(meal)"
                      />
                      <label
                        class="form-check-label fw-bold small meal-title cursor-pointer"
                        @click="openMealPlanModal(meal)"
                      >
                        {{ meal.recipe_title }}
                      </label>
                    </div>
                    <button class="btn btn-link btn-xs p-0 text-muted" type="button" @click="confirmDeleteMeal(meal)">
                      <i class="bi bi-x"></i>
                    </button>
                  </div>
                  <div class="d-flex align-items-center justify-content-between mt-1 pt-1 border-top border-light-subtle">
                    <span v-if="meal.assigned_member" class="cook-badge xsmall text-truncate" style="max-width: 110px;">
                      <i class="bi bi-person-fill me-1 text-danger"></i>{{ meal.assigned_member.name }}
                    </span>
                    <span v-else class="text-muted xsmall">—</span>
                    <button
                      v-if="meal.ingredients && meal.ingredients.length > 0"
                      type="button"
                      class="btn btn-link btn-xs p-0 text-warning text-decoration-none"
                      @click="exportMealToShopping(meal)"
                      title="Kirim bahan ke belanja"
                    >
                      <i class="bi bi-cart-plus"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Camilan / Bekal / Snack -->
            <div class="slot-section">
              <div class="slot-label d-flex justify-content-between align-items-center mb-1">
                <span class="xsmall fw-bold text-muted text-uppercase">
                  <i class="bi bi-egg-fried text-info me-1"></i>
                  {{ isId ? 'Camilan / Bekal' : 'Snack / Lunchbox' }}
                </span>
                <button
                  type="button"
                  class="btn btn-link btn-sm p-0 text-decoration-none add-dish-btn"
                  @click="openMealPlanModal(null, day.dateStr, 'snack')"
                  title="Tambah Camilan"
                >
                  <i class="bi bi-plus-circle"></i>
                </button>
              </div>
              <div class="meals-slot-list d-flex flex-column gap-1">
                <div
                  v-for="meal in day.meals.snack"
                  :key="meal.id"
                  class="meal-card p-2 rounded-3 border"
                  :class="{ 'completed-meal': meal.is_completed }"
                >
                  <div class="d-flex align-items-start justify-content-between gap-1">
                    <div class="form-check mb-0">
                      <input
                        class="form-check-input mt-1"
                        type="checkbox"
                        :checked="meal.is_completed"
                        @change="toggleMealCompleted(meal)"
                      />
                      <label
                        class="form-check-label fw-bold small meal-title cursor-pointer"
                        @click="openMealPlanModal(meal)"
                      >
                        {{ meal.recipe_title }}
                      </label>
                    </div>
                    <button class="btn btn-link btn-xs p-0 text-muted" type="button" @click="confirmDeleteMeal(meal)">
                      <i class="bi bi-x"></i>
                    </button>
                  </div>
                  <div class="d-flex align-items-center justify-content-between mt-1 pt-1 border-top border-light-subtle">
                    <span v-if="meal.assigned_member" class="cook-badge xsmall text-truncate" style="max-width: 110px;">
                      <i class="bi bi-person-fill me-1 text-danger"></i>{{ meal.assigned_member.name }}
                    </span>
                    <span v-else class="text-muted xsmall">—</span>
                    <button
                      v-if="meal.ingredients && meal.ingredients.length > 0"
                      type="button"
                      class="btn btn-link btn-xs p-0 text-warning text-decoration-none"
                      @click="exportMealToShopping(meal)"
                      title="Kirim bahan ke belanja"
                    >
                      <i class="bi bi-cart-plus"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- TAB 2: PANTRY & FRIDGE INVENTORY -->
    <!-- ========================================================================= -->
    <div v-if="activeTab === 'pantry'" class="tab-pane-fade">
      <!-- Filter Bar -->
      <div class="pantry-filter-bar p-3 rounded-4 mb-3 d-flex flex-wrap align-items-center justify-content-between gap-3">
        <!-- Zone Switcher Pills -->
        <div class="d-flex flex-wrap gap-2">
          <button
            type="button"
            class="btn btn-sm zone-filter-btn"
            :class="{ active: pantryStore.filterLocation === 'all' }"
            @click="pantryStore.setLocationFilter('all')"
          >
            {{ isId ? 'Semua Area' : 'All Zones' }} ({{ pantryStore.totalCount }})
          </button>
          <button
            type="button"
            class="btn btn-sm zone-filter-btn"
            :class="{ active: pantryStore.filterLocation === 'fridge' }"
            @click="pantryStore.setLocationFilter('fridge')"
          >
            <i class="bi bi-snow2 text-cyan me-1"></i>
            {{ isId ? 'Kulkas' : 'Fridge' }} ({{ pantryStore.fridgeCount }})
          </button>
          <button
            type="button"
            class="btn btn-sm zone-filter-btn"
            :class="{ active: pantryStore.filterLocation === 'freezer' }"
            @click="pantryStore.setLocationFilter('freezer')"
          >
            <i class="bi bi-badge-vr-fill text-primary me-1"></i>
            {{ isId ? 'Freezer' : 'Freezer' }} ({{ pantryStore.freezerCount }})
          </button>
          <button
            type="button"
            class="btn btn-sm zone-filter-btn"
            :class="{ active: pantryStore.filterLocation === 'pantry' }"
            @click="pantryStore.setLocationFilter('pantry')"
          >
            <i class="bi bi-box-seam-fill text-warning me-1"></i>
            {{ isId ? 'Lemari Kering' : 'Pantry' }} ({{ pantryStore.pantryCount }})
          </button>
        </div>

        <!-- Search & Category -->
        <div class="d-flex align-items-center gap-2 flex-grow-1 flex-md-grow-0" style="min-width: 260px;">
          <div class="input-group input-group-sm">
            <span class="input-group-text bg-transparent border-end-0">
              <i class="bi bi-search text-muted"></i>
            </span>
            <input
              type="text"
              class="form-control border-start-0"
              :placeholder="isId ? 'Cari bahan dapur...' : 'Search pantry items...'"
              v-model="pantryStore.searchQuery"
            />
          </div>
          <button
            type="button"
            class="btn btn-sm btn-primary text-nowrap d-flex align-items-center gap-1"
            @click="openPantryModal()"
          >
            <i class="bi bi-plus-lg"></i>
            <span>{{ isId ? 'Tambah' : 'Add' }}</span>
          </button>
        </div>
      </div>

      <!-- Inventory Items Grid -->
      <div v-if="pantryStore.loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status"></div>
        <p class="text-muted mt-2 small">{{ isId ? 'Memuat stok bahan...' : 'Loading pantry items...' }}</p>
      </div>

      <div v-else-if="pantryStore.filteredItems.length === 0" class="empty-state-box text-center py-5 rounded-4 border">
        <div class="empty-icon mb-3">
          <i class="bi bi-basket3 text-muted display-4"></i>
        </div>
        <h5 class="fw-bold">{{ isId ? 'Belum Ada Bahan di Area Ini' : 'No Items in This Zone' }}</h5>
        <p class="text-muted small mb-3">
          {{ isId ? 'Catat stok kulkas atau lemari kering Anda agar lebih mudah merencanakan menu.' : 'Add your kitchen stock to easily plan weekly recipes.' }}
        </p>
        <button type="button" class="btn btn-primary rounded-pill px-4" @click="openPantryModal()">
          <i class="bi bi-plus-lg me-1"></i> {{ isId ? 'Tambah Bahan Pertama' : 'Add First Item' }}
        </button>
      </div>

      <div v-else class="pantry-items-grid">
        <div
          v-for="item in pantryStore.filteredItems"
          :key="item.id"
          class="pantry-card p-3 rounded-4 border position-relative"
          :class="{
            'border-danger-subtle bg-danger-subtle bg-opacity-10': isExpired(item.expiration_date),
            'border-warning-subtle bg-warning-subtle bg-opacity-10': isExpiring(item.expiration_date)
          }"
        >
          <!-- Zone & Category Badges -->
          <div class="d-flex justify-content-between align-items-start mb-2">
            <div class="d-flex align-items-center gap-1">
              <span class="badge rounded-pill zone-tag" :class="item.location">
                <i class="bi" :class="getLocationIcon(item.location)"></i>
                {{ getLocationName(item.location) }}
              </span>
              <span class="badge rounded-pill bg-body-secondary text-body-secondary xsmall">
                {{ getCategoryEmoji(item.category) }} {{ item.category }}
              </span>
            </div>

            <!-- Expiry indicator -->
            <span v-if="item.expiration_date" class="badge rounded-pill xsmall" :class="getExpiryBadgeClass(item.expiration_date)">
              <i class="bi bi-clock-history me-1"></i>
              {{ formatExpiryText(item.expiration_date) }}
            </span>
          </div>

          <!-- Item Name & Notes -->
          <h5 class="fw-bold mb-1 item-name">{{ item.name }}</h5>
          <p v-if="item.notes" class="text-muted xsmall mb-2 text-truncate">{{ item.notes }}</p>

          <!-- Stepper & Actions -->
          <div class="d-flex align-items-center justify-content-between mt-3 pt-2 border-top border-light-subtle">
            <!-- Stepper -->
            <div class="quantity-stepper d-flex align-items-center gap-2">
              <button
                type="button"
                class="btn btn-sm btn-stepper"
                @click="adjustQty(item, -1)"
                title="Kurangi 1"
              >
                <i class="bi bi-dash"></i>
              </button>
              <span class="fw-bold px-1 fs-6">
                {{ item.quantity }} <span class="text-muted fw-normal xsmall">{{ item.unit || 'pcs' }}</span>
              </span>
              <button
                type="button"
                class="btn btn-sm btn-stepper"
                @click="adjustQty(item, 1)"
                title="Tambah 1"
              >
                <i class="bi bi-plus"></i>
              </button>
            </div>

            <!-- Actions -->
            <div class="d-flex align-items-center gap-1">
              <button
                type="button"
                class="btn btn-sm btn-outline-secondary btn-icon-round"
                @click="openPantryModal(item)"
                title="Edit"
              >
                <i class="bi bi-pencil"></i>
              </button>
              <button
                type="button"
                class="btn btn-sm btn-outline-danger btn-icon-round"
                @click="confirmDeleteItem(item)"
                title="Hapus"
              >
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- TAB 3: RECIPE BOX -->
    <!-- ========================================================================= -->
    <div v-if="activeTab === 'recipes'" class="tab-pane-fade">
      <!-- Recipe Toolbar -->
      <div class="pantry-filter-bar p-3 rounded-4 mb-3 d-flex flex-wrap align-items-center justify-content-between gap-3">
        <div class="d-flex align-items-center gap-2 flex-wrap">
          <button
            type="button"
            class="btn btn-sm"
            :class="recipeFilterFav ? 'btn-warning text-dark' : 'btn-outline-secondary'"
            @click="toggleRecipeFavFilter"
          >
            <i class="bi bi-star-fill me-1"></i>
            {{ isId ? 'Hanya Favorit' : 'Favorites Only' }}
          </button>
        </div>

        <div class="d-flex align-items-center gap-2 flex-grow-1 flex-md-grow-0" style="min-width: 260px;">
          <div class="input-group input-group-sm">
            <span class="input-group-text bg-transparent border-end-0">
              <i class="bi bi-search text-muted"></i>
            </span>
            <input
              type="text"
              class="form-control border-start-0"
              :placeholder="isId ? 'Cari resep favorit...' : 'Search recipes...'"
              v-model="recipeSearch"
              @input="loadRecipes"
            />
          </div>
          <button
            type="button"
            class="btn btn-sm btn-ai-sparkle text-nowrap d-flex align-items-center gap-1"
            @click="openAiRecipeModal"
          >
            <i class="bi bi-magic"></i>
            <span>{{ isId ? 'Koki AI' : 'AI Chef' }}</span>
          </button>
        </div>
      </div>

      <!-- Recipes Grid -->
      <div v-if="loadingRecipes" class="text-center py-5">
        <div class="spinner-border text-primary" role="status"></div>
      </div>

      <div v-else-if="recipes.length === 0" class="empty-state-box text-center py-5 rounded-4 border">
        <div class="empty-icon mb-3">
          <i class="bi bi-journal-album text-muted display-4"></i>
        </div>
        <h5 class="fw-bold">{{ isId ? 'Belum Ada Resep Tersimpan' : 'No Recipes Saved Yet' }}</h5>
        <p class="text-muted small mb-3">
          {{ isId ? 'Gunakan Koki AI untuk meracik resep dari kulkas dan simpan hidangan favorit keluargamu di sini.' : 'Use the AI Chef to generate delicious recipes and save them here.' }}
        </p>
        <button type="button" class="btn btn-ai-sparkle rounded-pill px-4" @click="openAiRecipeModal">
          <i class="bi bi-magic me-1"></i> {{ isId ? 'Racik dengan AI Chef' : 'Generate with AI Chef' }}
        </button>
      </div>

      <div v-else class="recipes-grid">
        <div
          v-for="recipe in recipes"
          :key="recipe.id"
          class="recipe-box-card p-3 rounded-4 border d-flex flex-column justify-content-between"
        >
          <div>
            <div class="d-flex justify-content-between align-items-start mb-2">
              <span class="badge rounded-pill bg-primary-subtle text-primary xsmall text-uppercase">
                {{ recipe.category || 'Dinner' }}
              </span>
              <button
                type="button"
                class="btn btn-link btn-sm p-0 text-warning"
                @click="toggleRecipeFav(recipe)"
              >
                <i class="bi" :class="recipe.is_favorite ? 'bi-star-fill' : 'bi-star'"></i>
              </button>
            </div>

            <h5 class="fw-bold mb-1 recipe-title cursor-pointer" @click="openRecipeDetail(recipe)">
              {{ recipe.name }}
            </h5>
            <p class="text-muted small mb-3 text-truncate-2">{{ recipe.description }}</p>

            <div class="d-flex align-items-center gap-3 text-muted xsmall mb-3">
              <span><i class="bi bi-clock me-1 text-warning"></i>{{ (recipe.prep_time_minutes || 10) + (recipe.cook_time_minutes || 15) }}m</span>
              <span><i class="bi bi-people me-1 text-info"></i>{{ recipe.servings || 4 }} {{ isId ? 'porsi' : 'servings' }}</span>
              <span><i class="bi bi-fire me-1 text-danger"></i>{{ recipe.difficulty || 'Easy' }}</span>
            </div>
          </div>

          <div class="d-flex align-items-center justify-content-between pt-2 border-top border-light-subtle">
            <button
              type="button"
              class="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
              @click="scheduleRecipeToMealPlan(recipe)"
            >
              <i class="bi bi-calendar-plus"></i>
              <span>{{ isId ? 'Jadwalkan' : 'Schedule' }}</span>
            </button>
            <button
              type="button"
              class="btn btn-sm btn-link text-decoration-none text-primary fw-semibold d-inline-flex align-items-center gap-1"
              @click="openRecipeDetail(recipe)"
            >
              <span>{{ isId ? 'Detail Resep' : 'View Recipe' }}</span>
              <i class="bi bi-arrow-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <PantryItemModal
      :show="showPantryModal"
      :item-data="selectedPantryItem"
      @close="showPantryModal = false"
      @save="handleSavePantryItem"
    />

    <MealPlanModal
      :show="showMealPlanModal"
      :plan-data="selectedMealPlan"
      :default-date="defaultPlanDate"
      :default-slot="defaultPlanSlot"
      @close="showMealPlanModal = false"
      @save="handleSaveMealPlan"
    />

    <AiRecipeModal
      :show="showAiModal"
      :pantry-items="pantryStore.items"
      @close="showAiModal = false"
      @schedule="handleAiSchedule"
      @save-recipe="handleAiSaveRecipe"
      @export-shopping="handleAiExportShopping"
    />

    <RecipeDetailModal
      :show="showRecipeDetailModal"
      :recipe="selectedRecipe"
      @close="showRecipeDetailModal = false"
      @toggle-fav="handleRecipeDetailToggleFav"
      @schedule="handleRecipeDetailSchedule"
      @export-shopping="handleRecipeDetailExportShopping"
    />

    <ExportShoppingModal
      :show="showExportShoppingModal"
      :ingredients="exportIngredientsList"
      @close="showExportShoppingModal = false"
      @success="handleExportSuccess"
    />

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="vue-modal-backdrop" @mousedown.self="showDeleteModal = false">
      <div class="vue-modal p-4" style="max-width: 400px;">
        <div class="text-center mb-3">
          <div class="delete-icon-circle mx-auto mb-2 bg-danger-subtle text-danger">
            <i class="bi bi-exclamation-triangle-fill fs-3"></i>
          </div>
          <h5 class="fw-bold">{{ isId ? 'Konfirmasi Hapus' : 'Confirm Delete' }}</h5>
          <p class="text-muted small mb-0">
            {{ isId ? `Apakah Anda yakin ingin menghapus "${itemToDelete?.title}"?` : `Are you sure you want to delete "${itemToDelete?.title}"?` }}
          </p>
        </div>
        <div class="d-flex gap-2 justify-content-center">
          <button type="button" class="btn btn-secondary px-3" @click="showDeleteModal = false">
            {{ isId ? 'Batal' : 'Cancel' }}
          </button>
          <button type="button" class="btn btn-danger px-4" @click="executeDelete">
            {{ isId ? 'Hapus' : 'Delete' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useLocaleStore } from '../stores/locale';
import { usePantryStore } from '../stores/pantry';
import { useMealPlanStore } from '../stores/mealPlan';
import { useToastStore } from '../stores/toast';
import { recipeService } from '../services/recipeService';

import PantryItemModal from '../components/meals/PantryItemModal.vue';
import MealPlanModal from '../components/meals/MealPlanModal.vue';
import AiRecipeModal from '../components/meals/AiRecipeModal.vue';
import RecipeDetailModal from '../components/meals/RecipeDetailModal.vue';
import ExportShoppingModal from '../components/meals/ExportShoppingModal.vue';

const localeStore = useLocaleStore();
const pantryStore = usePantryStore();
const mealPlanStore = useMealPlanStore();
const toastStore = useToastStore();

const isId = computed(() => localeStore.currentLocale === 'id');

const activeTab = ref('planner'); // 'planner' | 'pantry' | 'recipes'

// Modals state
const showPantryModal = ref(false);
const selectedPantryItem = ref(null);

const showMealPlanModal = ref(false);
const selectedMealPlan = ref(null);
const defaultPlanDate = ref('');
const defaultPlanSlot = ref('dinner');

const showAiModal = ref(false);

const showRecipeDetailModal = ref(false);
const selectedRecipe = ref(null);

const showExportShoppingModal = ref(false);
const exportIngredientsList = ref([]);

// Delete modal state
const showDeleteModal = ref(false);
const itemToDelete = ref(null); // { type: 'pantry' | 'meal' | 'recipe', id, title }

// Recipes tab state
const recipes = ref([]);
const loadingRecipes = ref(false);
const recipeFilterFav = ref(false);
const recipeSearch = ref('');

onMounted(async () => {
  await Promise.all([
    pantryStore.fetchItems(),
    mealPlanStore.fetchCurrentWeek(),
    loadRecipes()
  ]);
});

async function loadRecipes() {
  loadingRecipes.value = true;
  try {
    const params = {};
    if (recipeFilterFav.value) params.is_favorite = true;
    if (recipeSearch.value.trim()) params.search = recipeSearch.value.trim();
    const res = await recipeService.list(params);
    recipes.value = res.data?.data || [];
  } catch (err) {
    console.error('Failed to load recipes:', err);
  } finally {
    loadingRecipes.value = false;
  }
}

// Week navigation
const isCurrentWeek = computed(() => {
  const today = new Date().toISOString().split('T')[0];
  return today >= mealPlanStore.startDateStr && today <= mealPlanStore.endDateStr;
});

function prevWeek() {
  mealPlanStore.prevWeek();
}

function nextWeek() {
  mealPlanStore.nextWeek();
}

function goToCurrentWeek() {
  mealPlanStore.goToCurrentWeek();
}

async function copyWeekNext() {
  try {
    await mealPlanStore.copyWeekToNext();
    toastStore.success(isId.value ? 'Menu berhasil disalin ke minggu depan!' : 'Meal plan copied to next week!');
  } catch (err) {
    toastStore.error(err.message || 'Error copying week');
  }
}

function formatWeekRange(startStr, endStr) {
  if (!startStr || !endStr) return '';
  const s = new Date(startStr);
  const e = new Date(endStr);
  const opt = { day: 'numeric', month: 'short' };
  return `${s.toLocaleDateString(isId.value ? 'id-ID' : 'en-US', opt)} – ${e.toLocaleDateString(isId.value ? 'id-ID' : 'en-US', opt + ', year: numeric')}`;
}

// Meal Plan handlers
function openMealPlanModal(meal = null, date = '', slot = 'dinner') {
  selectedMealPlan.value = meal;
  defaultPlanDate.value = date || new Date().toISOString().split('T')[0];
  defaultPlanSlot.value = slot || 'dinner';
  showMealPlanModal.value = true;
}

async function handleSaveMealPlan({ id, data }) {
  try {
    if (id) {
      await mealPlanStore.updateMealPlan(id, data);
      toastStore.success(isId.value ? 'Menu berhasil diperbarui!' : 'Meal updated!');
    } else {
      await mealPlanStore.addMealPlan(data);
      toastStore.success(isId.value ? 'Menu berhasil dijadwalkan!' : 'Meal scheduled!');
    }
    showMealPlanModal.value = false;
  } catch (err) {
    toastStore.error(err.message || 'Error saving meal');
  }
}

async function toggleMealCompleted(meal) {
  try {
    await mealPlanStore.toggleCompleted(meal.id, !meal.is_completed);
  } catch (err) {
    toastStore.error('Failed to update meal status');
  }
}

function exportMealToShopping(meal) {
  if (meal.ingredients && meal.ingredients.length > 0) {
    exportIngredientsList.value = meal.ingredients;
    showExportShoppingModal.value = true;
  }
}

function confirmDeleteMeal(meal) {
  itemToDelete.value = {
    type: 'meal',
    id: meal.id,
    title: meal.recipe_title
  };
  showDeleteModal.value = true;
}

// Pantry Handlers
function openPantryModal(item = null) {
  selectedPantryItem.value = item;
  showPantryModal.value = true;
}

async function handleSavePantryItem({ id, data }) {
  try {
    if (id) {
      await pantryStore.updateItem(id, data);
      toastStore.success(isId.value ? 'Bahan dapur diperbarui!' : 'Item updated!');
    } else {
      await pantryStore.addItem(data);
      toastStore.success(isId.value ? 'Bahan dapur berhasil ditambahkan!' : 'Item added!');
    }
    showPantryModal.value = false;
  } catch (err) {
    toastStore.error(err.message || 'Error saving item');
  }
}

async function adjustQty(item, delta) {
  try {
    await pantryStore.adjustQuantity(item.id, delta);
  } catch (err) {
    toastStore.error('Failed to update quantity');
  }
}

function confirmDeleteItem(item) {
  itemToDelete.value = {
    type: 'pantry',
    id: item.id,
    title: item.name
  };
  showDeleteModal.value = true;
}

// AI Recipe Modal Handlers
function openAiRecipeModal() {
  showAiModal.value = true;
}

function handleAiSchedule(recipe) {
  showAiModal.value = false;
  selectedMealPlan.value = null;
  defaultPlanDate.value = new Date().toISOString().split('T')[0];
  defaultPlanSlot.value = recipe.category || 'dinner';
  // Pre-fill
  selectedMealPlan.value = {
    recipe_title: recipe.name,
    description: recipe.description + (recipe.tips ? ` | Tips: ${recipe.tips}` : ''),
    meal_type: recipe.category || 'dinner',
    ingredients: recipe.ingredients || []
  };
  showMealPlanModal.value = true;
}

async function handleAiSaveRecipe(recipe) {
  try {
    const payload = {
      family_id: mealPlanStore.currentMonday ? (await import('../stores/auth')).useAuthStore().familyId : null,
      name: recipe.name,
      description: recipe.description,
      category: recipe.category || 'dinner',
      prep_time_minutes: recipe.prep_time_minutes || 15,
      cook_time_minutes: recipe.cook_time_minutes || 20,
      servings: recipe.servings || 4,
      difficulty: recipe.difficulty || 'easy',
      ingredients: recipe.ingredients || [],
      instructions: recipe.instructions || [],
      is_favorite: true
    };
    await recipeService.create(payload);
    await loadRecipes();
    toastStore.success(isId.value ? 'Resep berhasil disimpan ke Buku Resep!' : 'Recipe saved to Recipe Box!');
  } catch (err) {
    toastStore.error(err.message || 'Failed to save recipe');
  }
}

function handleAiExportShopping(ingredients) {
  exportIngredientsList.value = ingredients;
  showExportShoppingModal.value = true;
}

// Recipe Box Handlers
function openRecipeDetail(recipe) {
  selectedRecipe.value = recipe;
  showRecipeDetailModal.value = true;
}

async function toggleRecipeFav(recipe) {
  try {
    recipe.is_favorite = !recipe.is_favorite;
    await recipeService.toggleFavorite(recipe.id, recipe.is_favorite);
  } catch (err) {
    toastStore.error('Failed to update favorite');
  }
}

function toggleRecipeFavFilter() {
  recipeFilterFav.value = !recipeFilterFav.value;
  loadRecipes();
}

function scheduleRecipeToMealPlan(recipe) {
  selectedMealPlan.value = null;
  defaultPlanDate.value = new Date().toISOString().split('T')[0];
  defaultPlanSlot.value = recipe.category || 'dinner';
  selectedMealPlan.value = {
    recipe_title: recipe.name,
    description: recipe.description,
    meal_type: recipe.category || 'dinner',
    ingredients: recipe.ingredients || []
  };
  showMealPlanModal.value = true;
}

function handleRecipeDetailSchedule(recipe) {
  showRecipeDetailModal.value = false;
  scheduleRecipeToMealPlan(recipe);
}

function handleRecipeDetailToggleFav({ id, isFavorite }) {
  recipeService.toggleFavorite(id, isFavorite);
}

function handleRecipeDetailExportShopping(ingredients) {
  exportIngredientsList.value = ingredients;
  showExportShoppingModal.value = true;
}

function handleExportSuccess() {
  // Can trigger refresh if needed
}

// Delete execution
async function executeDelete() {
  if (!itemToDelete.value) return;
  try {
    if (itemToDelete.value.type === 'pantry') {
      await pantryStore.deleteItem(itemToDelete.value.id);
      toastStore.success(isId.value ? 'Bahan dapur berhasil dihapus' : 'Item deleted');
    } else if (itemToDelete.value.type === 'meal') {
      await mealPlanStore.deleteMealPlan(itemToDelete.value.id);
      toastStore.success(isId.value ? 'Menu berhasil dihapus' : 'Meal deleted');
    }
    showDeleteModal.value = false;
  } catch (err) {
    toastStore.error(err.message || 'Error deleting item');
  }
}

// Helper formats
function getLocationIcon(loc) {
  switch (loc) {
    case 'fridge': return 'bi-snow2';
    case 'freezer': return 'bi-badge-vr-fill';
    case 'pantry': return 'bi-box-seam-fill';
    default: return 'bi-archive';
  }
}

function getLocationName(loc) {
  if (isId.value) {
    switch (loc) {
      case 'fridge': return 'Kulkas';
      case 'freezer': return 'Freezer';
      case 'pantry': return 'Lemari Kering';
      default: return 'Pantry';
    }
  }
  return loc ? loc.toUpperCase() : 'PANTRY';
}

function getCategoryEmoji(cat) {
  switch (cat) {
    case 'produce': return '🥦';
    case 'meat': return '🥩';
    case 'dairy': return '🥛';
    case 'carbs': return '🍚';
    case 'condiment': return '🧂';
    case 'frozen': return '🧊';
    case 'beverage': return '🧃';
    case 'snack': return '🍪';
    default: return '📦';
  }
}

function getDaysDiff(dateStr) {
  if (!dateStr) return 0;
  const parts = dateStr.split('-').map(Number);
  if (parts.length < 3 || isNaN(parts[0])) return 0;
  const targetDate = new Date(parts[0], parts[1] - 1, parts[2]);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((targetDate - today) / (1000 * 60 * 60 * 24));
}

function isExpired(dateStr) {
  if (!dateStr) return false;
  return getDaysDiff(dateStr) < 0;
}

function isExpiring(dateStr) {
  if (!dateStr) return false;
  const diff = getDaysDiff(dateStr);
  return diff >= 0 && diff <= 3;
}

function formatExpiryText(dateStr) {
  if (!dateStr) return '';
  const diff = getDaysDiff(dateStr);
  if (diff < 0) return isId.value ? `Kadaluarsa (${Math.abs(diff)}h)` : `Expired (${Math.abs(diff)}d)`;
  if (diff === 0) return isId.value ? 'Hari ini!' : 'Today!';
  if (diff === 1) return isId.value ? 'Besok' : 'Tomorrow';
  return isId.value ? `${diff} hari lagi` : `In ${diff} days`;
}

function getExpiryBadgeClass(dateStr) {
  if (isExpired(dateStr)) return 'bg-danger text-white';
  if (isExpiring(dateStr)) return 'bg-warning text-dark';
  return 'bg-success-subtle text-success';
}
</script>

<style scoped>
.meals-page-container {
  padding-bottom: 50px;
}

.meals-hero {
  background: var(--card-bg);
  backdrop-filter: blur(12px);
  border: var(--card-border);
  box-shadow: var(--card-shadow);
}

.text-gradient {
  background: linear-gradient(135deg, var(--primary-color) 0%, #0dcaf0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.btn-ai-sparkle {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  border: none;
  box-shadow: 0 4px 14px rgba(102, 126, 234, 0.35);
  transition: all 0.2s ease;
}

.btn-ai-sparkle:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
  color: #ffffff;
}

.metric-card {
  background: var(--input-bg);
  border: 1px solid var(--card-border);
  cursor: pointer;
  transition: all 0.2s ease;
}

.metric-card:hover {
  transform: translateY(-2px);
  border-color: var(--primary-color);
}

.metric-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.15rem;
}

.metric-icon.fridge {
  background: rgba(13, 202, 240, 0.15);
  color: #0dcaf0;
}

.metric-icon.freezer {
  background: rgba(13, 110, 253, 0.15);
  color: #0d6efd;
}

.metric-icon.pantry {
  background: rgba(255, 193, 7, 0.15);
  color: #ffc107;
}

.metric-icon.expiring {
  background: rgba(220, 53, 69, 0.15);
  color: #dc3545;
}

.expiring-ribbon {
  background: linear-gradient(135deg, rgba(255, 193, 7, 0.2) 0%, rgba(255, 230, 156, 0.35) 100%);
}

.custom-nav-pills .nav-link {
  color: var(--text-muted);
  transition: all 0.2s ease;
}

.custom-nav-pills .nav-link.active {
  background: var(--primary-color);
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.planner-toolbar,
.pantry-filter-bar {
  background: var(--card-bg);
  border: var(--card-border);
}

.nav-circle-btn {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 7-Day Matrix Layout */
.week-matrix-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 12px;
}

@media (max-width: 1400px) {
  .week-matrix-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 992px) {
  .week-matrix-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 576px) {
  .week-matrix-grid {
    grid-template-columns: 1fr;
  }
}

.day-column {
  background: var(--card-bg);
  border: var(--card-border);
  box-shadow: var(--card-shadow);
  transition: all 0.2s ease;
  min-height: 450px;
}

.day-column.is-today {
  border: 2px solid var(--primary-color);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.2);
}

.day-column:hover {
  box-shadow: var(--card-shadow-hover);
}

.meal-card {
  background: var(--input-bg);
  border-color: var(--card-border) !important;
  transition: all 0.15s ease;
}

.meal-card:hover {
  border-color: var(--primary-color) !important;
}

.completed-meal {
  opacity: 0.6;
}

.completed-meal .meal-title {
  text-decoration: line-through;
}

.cook-badge {
  color: var(--text-muted);
}

.add-dish-btn {
  color: var(--primary-color);
  font-size: 0.9rem;
}

.add-dish-btn:hover {
  transform: scale(1.1);
}

/* Pantry Inventory Grid */
.pantry-items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 14px;
}

.pantry-card {
  background: var(--card-bg);
  backdrop-filter: blur(8px);
  border: var(--card-border);
  box-shadow: var(--card-shadow);
  transition: all 0.2s ease;
}

.pantry-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--card-shadow-hover);
}

.zone-tag.fridge {
  background: rgba(13, 202, 240, 0.15);
  color: #0dcaf0;
}

.zone-tag.freezer {
  background: rgba(13, 110, 253, 0.15);
  color: #0d6efd;
}

.zone-tag.pantry {
  background: rgba(255, 193, 7, 0.15);
  color: #ffc107;
}

.btn-stepper {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  border: 1px solid var(--card-border);
  background: var(--input-bg);
  color: var(--text-color);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: all 0.15s ease;
}

.btn-stepper:hover {
  background: var(--primary-color);
  color: #ffffff;
  border-color: var(--primary-color);
}

.btn-icon-round {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.zone-filter-btn {
  border: 1px solid var(--card-border);
  background: var(--input-bg);
  color: var(--text-muted);
  border-radius: 20px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.zone-filter-btn.active {
  background: var(--primary-color);
  color: #ffffff;
  border-color: var(--primary-color);
}

/* Recipes Grid */
.recipes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.recipe-box-card {
  background: var(--card-bg);
  backdrop-filter: blur(8px);
  border: var(--card-border);
  box-shadow: var(--card-shadow);
  transition: all 0.2s ease;
  min-height: 200px;
}

.recipe-box-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--card-shadow-hover);
}

.text-truncate-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.delete-icon-circle {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pulse-badge {
  animation: pulse 1.6s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.xsmall {
  font-size: 0.75rem;
}

.cursor-pointer {
  cursor: pointer;
}
</style>
