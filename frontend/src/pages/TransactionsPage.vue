<template>
  <div class="transactions-page fade-in">
    <div id="tour-tx-header" class="page-header d-flex justify-content-between align-items-center flex-wrap gap-2">
      <div>
        <h4>{{ $t('transactions.title') }}</h4>
        <p>{{ $t('transactions.subtitle') }}</p>
      </div>
      <div class="d-flex gap-2">
        <button id="tour-tx-scan-btn" class="btn btn-outline-info" @click="triggerScan" :disabled="isScanning">
          <i class="bi bi-camera"></i><span class="d-none d-sm-inline">{{ $t('common.scanReceipt') || 'Scan Receipt' }}</span>
        </button>
        <input type="file" ref="receiptScannerInput" accept="image/*" capture="environment" class="d-none" @change="onReceiptSelected" />
        <button id="tour-tx-transfer-btn" class="btn btn-outline-primary" @click="openTransfer">
          <i class="bi bi-arrow-left-right"></i><span class="d-none d-sm-inline">{{ $t('common.transfer') }}</span>
        </button>
        <button id="tour-tx-add-btn" class="btn btn-primary-gradient" @click="openCreate">
          <i class="bi bi-plus-lg"></i><span class="d-none d-sm-inline">{{ $t('transactions.addTransaction') }}</span>
        </button>
      </div>
    </div>

    <!-- Scanning Overlay -->
    <div v-if="isScanning" class="vue-modal-backdrop" style="z-index: 1060; background: rgba(11, 11, 20, 0.9);">
      <div class="d-flex flex-column justify-content-center align-items-center h-100 text-white position-relative">
        <div class="ocr-scanner-box position-relative mb-4 overflow-hidden border border-primary border-opacity-25 rounded-4" style="width: 280px; height: 380px; background: rgba(255,255,255,0.02)">
          <!-- Camera icon/silhouette placeholder in the background -->
          <div class="position-absolute top-50 start-50 translate-middle text-white-50 opacity-25 text-center">
            <i class="bi bi-receipt fs-1 d-block mb-2"></i>
            <span class="small">{{ localeStore.currentLocale === 'id' ? 'Pratinjau Struk' : 'Receipt Preview' }}</span>
          </div>
          <!-- Laser Scan Line -->
          <div class="ocr-scan-line"></div>
        </div>
        <h5 class="fw-bold"><i class="bi bi-cpu text-info me-2 spinner-border-sm"></i>{{ scanStatus || $t('common.scanning') || 'Analyzing Receipt...' }}</h5>
        <p class="text-muted small mb-0">{{ scanProgress }}% processed</p>
      </div>
    </div>

    <!-- Filters -->
    <div id="tour-tx-filters" class="table-card mb-3">
      <div class="card-header">
        <div class="row g-2 align-items-end">
          <div class="col-md-3">
            <input v-model="filters.search" class="form-control form-control-sm" :placeholder="$t('transactions.searchPlaceholder')" @input="debouncedFetch" />
          </div>
          <div class="col-md-2">
            <select v-model="filters.type" class="form-select form-select-sm" @change="fetchData">
              <option value="">{{ $t('common.all') }} {{ $t('common.type') }}</option>
              <option value="income">{{ $t('common.income') }}</option>
              <option value="expense">{{ $t('common.expense') }}</option>
            </select>
          </div>
          <div class="col-md-2">
            <select v-model="filters.category_id" class="form-select form-select-sm" @change="fetchData">
              <option value="">{{ $t('transactions.allCategories') }}</option>
              <optgroup :label="$t('common.income')" v-if="incomeCategories.length">
                <option v-for="c in incomeCategories" :key="c.id" :value="c.id">{{ c.name }}</option>
              </optgroup>
              <optgroup :label="$t('common.expense')" v-if="expenseCategories.length">
                <option v-for="c in expenseCategories" :key="c.id" :value="c.id">{{ c.name }}</option>
              </optgroup>
            </select>
          </div>
          <div class="col-md-2">
            <select v-model="filters.member_id" class="form-select form-select-sm" @change="fetchData">
              <option value="">{{ $t('transactions.allMembers') }}</option>
              <template v-for="m in members" :key="m.id">
                <option v-if="m.is_active || m.id === filters.member_id" :value="m.id">{{ m.name }}</option>
              </template>
            </select>
          </div>
          <div class="col-md-2">
            <select v-model="filters.account_id" class="form-select form-select-sm" @change="fetchData">
              <option value="">{{ $t('transactions.allAccounts') }}</option>
              <optgroup v-for="(group, type) in groupedAccounts" :key="type" :label="translateAccountType(type)">
                <option v-for="a in group" :key="a.id" :value="a.id">{{ a.name }}</option>
              </optgroup>
            </select>
          </div>
          <div class="col-md-2">
            <input v-model="filters.date_from" type="date" class="form-control form-control-sm" @change="fetchData" />
          </div>
          <div class="col-md-2">
            <input v-model="filters.date_to" type="date" class="form-control form-control-sm" @change="fetchData" />
          </div>
          <div class="col-auto">
            <select v-model="filters.per_page" class="form-select form-select-sm" @change="fetchData">
              <option value="15">15 {{ localeStore.currentLocale === 'id' ? 'baris' : 'rows' }}</option>
              <option value="25">25 {{ localeStore.currentLocale === 'id' ? 'baris' : 'rows' }}</option>
              <option value="50">50 {{ localeStore.currentLocale === 'id' ? 'baris' : 'rows' }}</option>
              <option value="100">100 {{ localeStore.currentLocale === 'id' ? 'baris' : 'rows' }}</option>
            </select>
          </div>
          <div class="col-auto">
            <button class="btn btn-sm btn-outline-secondary" @click="resetFilters"><i class="bi bi-x-lg"></i> {{ $t('transactions.clearFilters') }}</button>
          </div>
        </div>
      </div>

      <div id="tour-tx-table" class="table-responsive">
        <table class="table table-hover mb-0">
          <thead>
            <tr>
              <th @click="sort('transaction_date')" style="cursor:pointer">{{ $t('common.date') }} <i class="bi bi-arrow-down-up small"></i></th>
              <th>{{ $t('common.member') }}</th>
              <th>{{ $t('common.account') }}</th>
              <th>{{ $t('common.category') }}</th>
              <th>{{ $t('common.type') }}</th>
              <th>{{ localeStore.currentLocale === 'id' ? 'Modul' : 'Module' }}</th>
              <th @click="sort('amount')" style="cursor:pointer">{{ $t('common.amount') }} <i class="bi bi-arrow-down-up small"></i></th>
              <th>{{ $t('common.description') }}</th>
              <th>{{ $t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="9" class="p-0 border-0">
                <SkeletonLoader type="table-row" v-for="i in 3" :key="i" />
              </td>
            </tr>
            <tr v-else-if="!transactions.length">
              <td colspan="9" class="text-center py-4 text-muted">{{ $t('dashboard.noTransactions') }}</td>
            </tr>
            <tr v-for="tx in transactions" :key="tx.id" 
                @touchstart="onTouchStart" 
                @touchend="onTouchEnd($event, tx)">
              <td>{{ tx.transaction_date }}</td>
              <td>{{ tx.member?.name || '-' }}</td>
              <td>{{ tx.account?.name || '-' }}</td>
              <td>{{ tx.category?.name || '-' }}</td>
              <td>
                <span class="badge" :class="'badge-' + tx.type">{{ $t('common.' + tx.type) }}</span>
              </td>
              <td>
                <span class="badge bg-secondary bg-opacity-25 text-dark border">{{ getTransactionModule(tx) }}</span>
              </td>
              <td class="fw-semibold" :class="getAmountClass(tx)">
                {{ formatAmountWithSign(tx) }}
              </td>
              <td>
                {{ tx.description || '-' }}
                <span v-if="tx.receipt_url" class="ms-1 text-muted" style="cursor:pointer" :title="localeStore.currentLocale === 'id' ? 'Lihat struk' : 'View receipt'" @click="openReceiptLightbox(tx)">📎</span>
              </td>
              <td>
                <div class="btn-group btn-group-sm">
                  <button v-if="tx.shopping_plans && tx.shopping_plans.length" class="btn btn-outline-info" @click="goToShoppingDetail(tx.shopping_plans[0].id)" title="View Shopping Plan"><i class="bi bi-cart"></i></button>
                  <button class="btn btn-outline-success" @click="openDuplicate(tx)" title="Duplicate" :disabled="getTransactionModule(tx) !== 'Manual'"><i class="bi bi-copy"></i></button>
                  <button class="btn btn-outline-primary" @click="openEdit(tx)" :title="$t('common.edit')" :disabled="getTransactionModule(tx) !== 'Manual' && getTransactionModule(tx) !== 'Transfer'"><i class="bi bi-pencil"></i></button>
                  <button class="btn btn-outline-danger" @click="confirmDelete(tx)" :title="$t('common.delete')" :disabled="getTransactionModule(tx) !== 'Manual' && getTransactionModule(tx) !== 'Transfer'"><i class="bi bi-trash"></i></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="meta.last_page > 1" class="card-footer d-flex justify-content-between align-items-center">
        <small class="text-muted">Showing {{ meta.from }}-{{ meta.to }} of {{ meta.total }}</small>
        <nav>
          <ul class="pagination pagination-sm mb-0">
            <li class="page-item" :class="{ disabled: meta.current_page <= 1 }">
              <a class="page-link" href="#" @click.prevent="goToPage(meta.current_page - 1)">‹</a>
            </li>
            <li v-for="p in meta.last_page" :key="p" class="page-item" :class="{ active: p === meta.current_page }">
              <a class="page-link" href="#" @click.prevent="goToPage(p)">{{ p }}</a>
            </li>
            <li class="page-item" :class="{ disabled: meta.current_page >= meta.last_page }">
              <a class="page-link" href="#" @click.prevent="goToPage(meta.current_page + 1)">›</a>
            </li>
          </ul>
        </nav>
      </div>
    </div>

    <!-- ===== Vue-Native: Create/Edit Modal ===== -->
    <div v-if="showTxModal" class="vue-modal-backdrop" @mousedown.self="showTxModal = false">
      <div class="vue-modal">
        <div class="modal-header">
          <h5 class="modal-title">{{ editingId ? $t('transactions.editTransaction') : $t('transactions.addTransaction') }}</h5>
          <button type="button" class="btn-close" @click="showTxModal = false"></button>
        </div>
        <form @submit.prevent="saveTransaction">
          <div class="modal-body">
            <div v-if="formError" class="alert alert-danger small">{{ formError }}</div>

            <!-- ✅ Duplicate detection warning -->
            <div v-if="possibleDuplicate" class="alert alert-warning d-flex align-items-start gap-2 small py-2 mb-3">
              <i class="bi bi-exclamation-triangle-fill mt-1 flex-shrink-0"></i>
              <div>
                <strong>{{ localeStore.currentLocale === 'id' ? 'Kemungkinan duplikat' : 'Possible duplicate' }}</strong><br />
                {{ localeStore.currentLocale === 'id'
                  ? `Transaksi serupa sudah ada: ${possibleDuplicate.description} — ${possibleDuplicate.amount} pada ${possibleDuplicate.date}`
                  : `A similar transaction already exists: ${possibleDuplicate.description} — ${possibleDuplicate.amount} on ${possibleDuplicate.date}` }}
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label" for="txType">{{ $t('common.type') }}</label>
              <select id="txType" name="type" v-model="form.type" class="form-select" required>
                <option value="" disabled>- {{ $t('common.type') }} -</option>
                <option value="income">{{ $t('common.income') }}</option>
                <option value="expense">{{ $t('common.expense') }}</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label d-flex align-items-center" for="txMember">
                {{ $t('common.member') }}
                <span v-if="scanConfidence?.member" :class="confidenceBadgeClass(scanConfidence.member)" class="badge rounded-pill fw-normal ms-2">
                  {{ confidenceBadgeLabel(scanConfidence.member) }}
                </span>
              </label>
              <select id="txMember" name="member_id" v-model="form.member_id" :class="['form-select', scanConfidence?.member === 'low' ? 'border-danger' : scanConfidence?.member === 'medium' ? 'border-warning' : '']" required>
                <option value="" disabled>- {{ $t('common.member') }} -</option>
                <template v-for="m in members" :key="m.id">
                  <option v-if="m.is_active || m.id === form.member_id" :value="m.id">{{ m.name }}{{ !m.is_active ? ' (' + $t('common.inactive') + ')' : '' }}</option>
                </template>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label d-flex align-items-center" for="txAccount">
                {{ $t('common.account') }}
                <span v-if="scanConfidence?.account" :class="confidenceBadgeClass(scanConfidence.account)" class="badge rounded-pill fw-normal ms-2">
                  {{ confidenceBadgeLabel(scanConfidence.account) }}
                </span>
              </label>
              <select id="txAccount" name="account_id" v-model="form.account_id" :class="['form-select', scanConfidence?.account === 'low' ? 'border-danger' : scanConfidence?.account === 'medium' ? 'border-warning' : '']" required>
                <option value="" disabled>- {{ $t('common.account') }} -</option>
                <optgroup v-for="(group, type) in groupedAccounts" :key="type" :label="translateAccountType(type)">
                  <option v-for="a in group" :key="a.id" :value="a.id">{{ a.name }}</option>
                </optgroup>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label d-flex align-items-center" for="txCategory">
                {{ $t('common.category') }}
                <span v-if="scanConfidence?.category" :class="confidenceBadgeClass(scanConfidence.category)" class="badge rounded-pill fw-normal ms-2">
                  {{ confidenceBadgeLabel(scanConfidence.category) }}
                </span>
              </label>
              <select id="txCategory" name="category_id" v-model="form.category_id" :class="['form-select', scanConfidence?.category === 'low' ? 'border-danger' : scanConfidence?.category === 'medium' ? 'border-warning' : '']">
                <option value="">- {{ $t('common.category') }} -</option>
                <option v-for="c in filteredCategories" :key="c.id" :value="c.id">{{ c.name }}</option>
              </select>
            </div>

            <!-- Amount + confidence badge -->
            <div class="mb-3">
              <label class="form-label d-flex align-items-center gap-2" for="txAmount">
                {{ $t('common.amount') }} (Rp)
                <span v-if="scanConfidence?.amount" :class="confidenceBadgeClass(scanConfidence.amount)" class="badge rounded-pill fw-normal">
                  {{ confidenceBadgeLabel(scanConfidence.amount) }}
                </span>
              </label>
              <input id="txAmount" name="amount" v-model.number="form.amount" type="number"
                :class="['form-control', scanConfidence?.amount === 'low' ? 'border-danger' : scanConfidence?.amount === 'medium' ? 'border-warning' : '']"
                min="1" required />
            </div>

            <!-- Date + confidence badge -->
            <div class="mb-3">
              <label class="form-label d-flex align-items-center gap-2" for="txDate">
                {{ $t('common.date') }}
                <span v-if="scanConfidence?.date" :class="confidenceBadgeClass(scanConfidence.date)" class="badge rounded-pill fw-normal">
                  {{ confidenceBadgeLabel(scanConfidence.date) }}
                </span>
              </label>
              <input id="txDate" name="transaction_date" v-model="form.transaction_date" type="date"
                :class="['form-control', scanConfidence?.date === 'low' ? 'border-danger' : scanConfidence?.date === 'medium' ? 'border-warning' : '']"
                required />
            </div>

            <!-- Description + confidence badge -->
            <div class="mb-3">
              <label class="form-label d-flex align-items-center gap-2" for="txDesc">
                {{ $t('common.description') }}
                <span v-if="scanConfidence?.merchant" :class="confidenceBadgeClass(scanConfidence.merchant)" class="badge rounded-pill fw-normal">
                  {{ confidenceBadgeLabel(scanConfidence.merchant) }}
                </span>
              </label>
              <input id="txDesc" name="description" v-model="form.description" type="text"
                :class="['form-control', scanConfidence?.merchant === 'low' ? 'border-danger' : scanConfidence?.merchant === 'medium' ? 'border-warning' : '']"
              />
            </div>

            <!-- Receipt image preview (scanned or already saved) -->
            <div v-if="pendingReceiptFile || form.receipt_url" class="mb-3">
              <label class="form-label"><i class="bi bi-image me-1"></i>{{ localeStore.currentLocale === 'id' ? 'Foto Struk' : 'Receipt Image' }}</label>
              <div class="d-flex align-items-center gap-3">
                <img
                  v-if="pendingReceiptPreview"
                  :src="pendingReceiptPreview"
                  alt="Receipt preview"
                  class="rounded border"
                  style="height:80px;width:60px;object-fit:cover;cursor:pointer"
                  @click="receiptLightboxUrl = pendingReceiptPreview; showReceiptLightbox = true"
                />
                <img
                  v-else-if="form.receipt_url && savedReceiptSignedUrl"
                  :src="savedReceiptSignedUrl"
                  alt="Receipt"
                  class="rounded border"
                  style="height:80px;width:60px;object-fit:cover;cursor:pointer"
                  @click="receiptLightboxUrl = savedReceiptSignedUrl; showReceiptLightbox = true"
                />
                <div v-else class="text-muted small"><span class="spinner-border spinner-border-sm"></span> Loading...</div>
                <div>
                  <div class="small text-muted mb-1">{{ localeStore.currentLocale === 'id' ? 'Klik gambar untuk tampilkan penuh' : 'Click image to enlarge' }}</div>
                  <button type="button" class="btn btn-sm btn-outline-danger" @click="clearReceiptImage">
                    <i class="bi bi-x-lg me-1"></i>{{ localeStore.currentLocale === 'id' ? 'Hapus Foto' : 'Remove Photo' }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Raw OCR Text panel (collapsible) -->
            <div v-if="scanRawText" class="mb-2">
              <button type="button" class="btn btn-link btn-sm text-muted px-0 py-0 text-decoration-none d-flex align-items-center gap-1"
                @click="showRawOcrPanel = !showRawOcrPanel">
                <i :class="showRawOcrPanel ? 'bi bi-chevron-down' : 'bi bi-chevron-right'"></i>
                <span class="small">{{ localeStore.currentLocale === 'id' ? 'Lihat teks OCR mentah' : 'View raw OCR text' }}</span>
              </button>
              <div v-if="showRawOcrPanel" class="mt-1 p-2 rounded border bg-black bg-opacity-25" style="max-height:160px;overflow-y:auto;">
                <pre class="mb-0 small text-muted" style="white-space:pre-wrap;font-size:0.72rem;">{{ scanRawText }}</pre>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showTxModal = false">{{ $t('common.cancel') }}</button>
            <button type="submit" class="btn btn-primary-gradient" :disabled="saving">
              <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>
              {{ $t('common.save') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ===== Vue-Native: Transfer Modal ===== -->
    <div v-if="showTransferModal" class="vue-modal-backdrop" @mousedown.self="showTransferModal = false">
      <div class="vue-modal">
        <div class="modal-header">
          <h5 class="modal-title">{{ $t('common.transfer') }}</h5>
          <button type="button" class="btn-close" @click="showTransferModal = false"></button>
        </div>
        <form @submit.prevent="saveTransfer">
          <div class="modal-body">
            <div v-if="transferError" class="alert alert-danger small">{{ transferError }}</div>
            <div class="mb-3">
              <label class="form-label" for="tfMember">{{ $t('common.member') }}</label>
              <select id="tfMember" name="member_id" v-model="transferForm.member_id" class="form-select" required>
                <option value="" disabled>- {{ $t('common.member') }} -</option>
                <template v-for="m in members" :key="m.id">
                  <option v-if="m.is_active || m.id === transferForm.member_id" :value="m.id">{{ m.name }}{{ !m.is_active ? ' (' + $t('common.inactive') + ')' : '' }}</option>
                </template>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label" for="tfFrom">{{ $t('transactions.fromAccount') }}</label>
              <select id="tfFrom" name="from_account_id" v-model="transferForm.from_account_id" class="form-select" required>
                <option value="" disabled>- {{ $t('transactions.fromAccount') }} -</option>
                <optgroup v-for="(group, type) in groupedAccounts" :key="type" :label="translateAccountType(type)">
                  <option v-for="a in group" :key="a.id" :value="a.id">{{ a.name }} ({{ formatCurrency(a.balance) }})</option>
                </optgroup>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label" for="tfTo">{{ $t('transactions.toAccount') }}</label>
              <select id="tfTo" name="to_account_id" v-model="transferForm.to_account_id" class="form-select" required>
                <option value="" disabled>- {{ $t('transactions.toAccount') }} -</option>
                <optgroup v-for="(group, type) in groupedAccounts" :key="type" :label="translateAccountType(type)">
                  <option v-for="a in group" :key="a.id" :value="a.id" :disabled="a.id === transferForm.from_account_id">{{ a.name }} ({{ formatCurrency(a.balance) }})</option>
                </optgroup>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label" for="tfAmount">{{ $t('common.amount') }} (Rp)</label>
              <input id="tfAmount" name="amount" v-model.number="transferForm.amount" type="number" class="form-control" min="1" required />
            </div>
            <div class="mb-3">
              <label class="form-label" for="tfDate">{{ $t('common.date') }}</label>
              <input id="tfDate" name="transaction_date" v-model="transferForm.transaction_date" type="date" class="form-control" required />
            </div>
            <div class="mb-3">
              <label class="form-label" for="tfDesc">{{ $t('common.description') }}</label>
              <input id="tfDesc" name="description" v-model="transferForm.description" type="text" class="form-control" :placeholder="$t('common.transfer')" />
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showTransferModal = false">{{ $t('common.cancel') }}</button>
            <button type="submit" class="btn btn-primary-gradient" :disabled="saving">{{ $t('common.transfer') }}</button>
          </div>
        </form>
      </div>
    </div>

    <!-- ===== Vue-Native: Delete Confirm Modal ===== -->
    <div v-if="showDeleteModal" class="vue-modal-backdrop" @mousedown.self="showDeleteModal = false">
      <div class="vue-modal" style="max-width:420px">
        <div class="modal-header border-0 pb-0">
          <h5 class="modal-title text-danger"><i class="bi bi-exclamation-triangle me-2"></i>{{ $t('common.delete') }} {{ $t('common.transaction') }}</h5>
          <button type="button" class="btn-close" @click="showDeleteModal = false"></button>
        </div>
        <div class="modal-body">
          <p class="mb-0">{{ $t('common.confirmDelete') }}</p>
        </div>
        <div class="modal-footer border-0 pt-0">
          <button class="btn btn-secondary" @click="showDeleteModal = false">{{ $t('common.cancel') }}</button>
          <button class="btn btn-danger" :disabled="deleting" @click="doDelete">
            <span v-if="deleting" class="spinner-border spinner-border-sm me-1"></span>
            {{ $t('common.delete') }}
          </button>
        </div>
      </div>
    </div>

    <!-- ===== Budget Over-Budget Confirmation Modal ===== -->
    <div v-if="showBudgetConfirm" class="vue-modal-backdrop" @mousedown.self="showBudgetConfirm = false">
      <div class="vue-modal" style="max-width:460px">
        <div class="modal-header border-0 pb-0">
          <h5 class="modal-title text-warning">
            <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ $t('transactions.budgetLimit') }} {{ localeStore.currentLocale === 'id' ? 'Terlampaui' : 'Exceeded' }}
          </h5>
          <button type="button" class="btn-close" @click="showBudgetConfirm = false"></button>
        </div>
        <div class="modal-body">
          <p class="mb-3">
            {{ $t('transactions.budgetExceededMsg', { category: budgetConfirmData.category }) }}
          </p>
          <div class="table-sm small mb-0">
            <div class="d-flex justify-content-between border-bottom py-1">
               <span class="text-muted">{{ $t('transactions.budgetLimit') }}</span>
               <span class="fw-semibold">{{ budgetConfirmData.limitFmt }}</span>
            </div>
            <div class="d-flex justify-content-between border-bottom py-1">
               <span class="text-muted">{{ $t('transactions.alreadySpent') }}</span>
               <span class="fw-semibold">{{ budgetConfirmData.spentFmt }}</span>
            </div>
            <div class="d-flex justify-content-between border-bottom py-1">
               <span class="text-muted">{{ $t('transactions.thisTransaction') }}</span>
               <span class="fw-semibold text-danger">{{ budgetConfirmData.addingFmt }}</span>
            </div>
            <div class="d-flex justify-content-between py-1">
               <span class="text-muted">{{ $t('transactions.totalAfterSave') }}</span>
               <span class="fw-bold text-danger">{{ budgetConfirmData.totalFmt }} ({{ budgetConfirmData.pct }}%)</span>
            </div>
          </div>
        </div>
        <div class="modal-footer border-0 pt-0">
          <button class="btn btn-secondary" @click="showBudgetConfirm = false">{{ $t('common.cancel') }}</button>
          <button class="btn btn-warning" :disabled="saving" @click="doSaveTransaction">
            <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>
            {{ $t('transactions.yesSaveAnyway') }}
          </button>
        </div>
      </div>
    </div>

  </div>

  <!-- ===== Receipt Image Lightbox ===== -->
  <div v-if="showReceiptLightbox" class="vue-modal-backdrop" style="z-index:2000;background:rgba(0,0,0,0.92)" @mousedown.self="showReceiptLightbox = false">
    <div class="d-flex flex-column align-items-center justify-content-center h-100 position-relative p-3">
      <button class="btn btn-outline-light btn-sm position-absolute top-0 end-0 m-3" @click="showReceiptLightbox = false">
        <i class="bi bi-x-lg"></i>
      </button>
      <img :src="receiptLightboxUrl" alt="Receipt" class="rounded shadow" style="max-width:90vw;max-height:85vh;object-fit:contain" />
      <p class="text-white-50 small mt-2 mb-0">{{ localeStore.currentLocale === 'id' ? 'Klik di luar gambar untuk menutup' : 'Click outside to close' }}</p>
    </div>
  </div>

</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { supabase } from '../lib/supabase';
import { useRouter } from 'vue-router';
import { useTour } from '../composables/useTour';
import SkeletonLoader from '../components/SkeletonLoader.vue';
import { transactionsTourSteps } from '../tours/transactionsTour';
import { scanReceipt } from '../utils/receiptScanner';
import { formatCurrency } from '../utils/format';
import { transactionService } from '../services/transactionService';
import { memberService } from '../services/memberService';
import { accountService } from '../services/accountService';
import { categoryService } from '../services/categoryService';
import { budgetService } from '../services/budgetService';
import { uploadReceipt, getReceiptSignedUrl, deleteReceipt } from '../services/storageService';
import { todayISO } from '../utils/date';
import { useToastStore } from '../stores/toast';
import { useBudgetStore } from '../stores/budgets';
import { useLocaleStore } from '../stores/locale';
import { useAuthStore } from '../stores/auth';
import { pushDispatcherService } from '../services/pushDispatcherService';

const transactions = ref([]);
const meta = ref({});
const members = ref([]);
const accounts = ref([]);
const categories = ref([]);
const loading = ref(false);
const saving = ref(false);
const deleting = ref(false);
const formError = ref('');
const transferError = ref('');
const editingId = ref(null);
const localeStore = useLocaleStore();
const budgetStore = useBudgetStore();

// Modal visibility
const showTxModal = ref(false);
const showTransferModal = ref(false);
const showDeleteModal = ref(false);
const deletingTx = ref(null);
const toast = useToastStore();

// OCR Scanning state
const receiptScannerInput = ref(null);
const isScanning = ref(false);
const scanProgress = ref(0);
const scanStatus = ref('');

// OpenCV + Tesseract scan result state
const scanConfidence  = ref(null);   // { merchant, amount, date } → 'high'|'medium'|'low'
const scanRawText     = ref('');     // raw OCR output for review panel
const showRawOcrPanel = ref(false);  // toggle for collapsible raw OCR panel
const possibleDuplicate = ref(null); // { description, amount, date } if duplicate detected

// Receipt image (pending upload after scan, or saved URL for existing record)
const pendingReceiptFile = ref(null);   // raw File object from scanner
const pendingReceiptPreview = ref('');  // local object-URL preview
const savedReceiptSignedUrl = ref('');  // signed URL fetched from storage
const receiptUrlToDelete = ref('');     // storage path to clean up on delete

// Lightbox
const showReceiptLightbox = ref(false);
const receiptLightboxUrl = ref('');

const authStore = useAuthStore();

// Budget over-budget confirmation
const showBudgetConfirm = ref(false);
const budgetConfirmData = ref({});
const wasBudgetExceeded = ref(false);

const router = useRouter();

function goToShoppingDetail(planId) {
  router.push(`/shopping/${planId}`);
}

function fmt(n) {
  const sign = n < 0 ? '-' : '';
  return sign + 'Rp ' + Math.abs(Number(n)).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function getAmountClass(tx) {
  return tx.type === 'income' || (tx.type === 'transfer' && tx.amount > 0) ? 'text-success' : 'text-danger';
}

function formatAmountWithSign(tx) {
  const isIncoming = tx.type === 'income' || (tx.type === 'transfer' && tx.amount > 0);
  const sign = isIncoming ? '+' : '-';
  return `${sign}${formatCurrency(Math.abs(tx.amount))}`;
}

function getTransactionModule(tx) {
  if (tx.shopping_plans && tx.shopping_plans.length > 0) return localeStore.currentLocale === 'id' ? 'Daftar Belanja' : 'Shopping List';
  if (tx.goal_id) return localeStore.currentLocale === 'id' ? 'Kantong Proyek' : 'Project Pockets';
  if (tx.description && tx.description.endsWith('(Auto)')) return localeStore.currentLocale === 'id' ? 'Berulang' : 'Recurring';
  if (tx.type === 'transfer') return 'Transfer';
  return 'Manual';
}

const filters = ref({
  search: '', type: '', category_id: '', member_id: '',
  account_id: '', date_from: '', date_to: '',
  sort_by: 'transaction_date', sort_dir: 'desc', page: 1, per_page: 15,
});

const form = ref({ type: '', member_id: '', account_id: '', category_id: '', amount: '', transaction_date: todayISO(), description: '' });
const transferForm = ref({ member_id: '', from_account_id: '', to_account_id: '', amount: '', transaction_date: todayISO(), description: '' });

// Translate account types for optgroups
function translateAccountType(type) {
  const t = String(type).toLowerCase();
  if (t === 'bank') return localeStore.t('accounts.type.bank');
  if (t === 'cash') return localeStore.t('accounts.type.cash');
  if (t === 'ewallet' || t === 'e-wallet') return localeStore.t('accounts.type.e_wallet');
  return type;
}

const groupedAccounts = computed(() => {
  const groups = {};
  accounts.value.forEach(a => {
    const t = a.type || 'other';
    let typeLabel = t;
    if (t === 'ewallet') typeLabel = 'e-Wallet';
    else typeLabel = t.charAt(0).toUpperCase() + t.slice(1);
    if (!groups[typeLabel]) groups[typeLabel] = [];
    groups[typeLabel].push(a);
  });
  return groups;
});

const filteredCategories = computed(() => {
  if (!form.value.type) return categories.value;
  return categories.value.filter(c => c.type === form.value.type);
});

const incomeCategories = computed(() => categories.value.filter(c => c.type === 'income'));
const expenseCategories = computed(() => categories.value.filter(c => c.type === 'expense'));

let debounceTimer = null;
function debouncedFetch() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(fetchData, 300);
}

async function fetchData() {
  loading.value = true;
  try {
    const params = {};
    Object.entries(filters.value).forEach(([k, v]) => {
      if (v !== '' && v !== null) params[k] = v;
    });
    const { data } = await transactionService.list(params);
    transactions.value = data.data;
    meta.value = data.meta || {};
  } finally {
    loading.value = false;
  }
}

function sort(field) {
  if (filters.value.sort_by === field) {
    filters.value.sort_dir = filters.value.sort_dir === 'asc' ? 'desc' : 'asc';
  } else {
    filters.value.sort_by = field;
    filters.value.sort_dir = 'desc';
  }
  fetchData();
}

function goToPage(p) {
  filters.value.page = p;
  fetchData();
}

// Reset filters back to default
function resetFilters() {
  filters.value = { search: '', type: '', category_id: '', member_id: '', account_id: '', date_from: '', date_to: '', sort_by: 'transaction_date', sort_dir: 'desc', page: 1, per_page: 15 };
  fetchData();
}

function clearReceiptImage() {
  if (form.value.receipt_url) {
    receiptUrlToDelete.value = form.value.receipt_url;
    form.value.receipt_url = '';
    savedReceiptSignedUrl.value = '';
  }
  if (pendingReceiptPreview.value) {
    URL.revokeObjectURL(pendingReceiptPreview.value);
    pendingReceiptPreview.value = '';
  }
  pendingReceiptFile.value = null;
}

async function openReceiptLightbox(tx) {
  if (!tx.receipt_url) return;
  try {
    const url = await getReceiptSignedUrl(tx.receipt_url);
    receiptLightboxUrl.value = url;
    showReceiptLightbox.value = true;
  } catch {
    toast.error(localeStore.currentLocale === 'id' ? 'Gagal memuat gambar struk.' : 'Failed to load receipt image.');
  }
}

// Confidence badge helpers
function confidenceBadgeClass(level) {
  if (level === 'high')   return 'bg-success text-white';
  if (level === 'medium') return 'bg-warning text-dark';
  return 'bg-danger text-white';
}
function confidenceBadgeLabel(level) {
  const isId = localeStore.currentLocale === 'id';
  if (level === 'high')   return isId ? 'Akurat' : 'Scanned';
  if (level === 'medium') return isId ? 'Periksa' : 'Please verify';
  return isId ? 'Mungkin salah' : 'Likely wrong';
}

function openCreate() {
  formError.value = '';
  editingId.value = null;
  pendingReceiptFile.value = null;
  pendingReceiptPreview.value = '';
  savedReceiptSignedUrl.value = '';
  receiptUrlToDelete.value = '';
  wasBudgetExceeded.value = false;
  scanConfidence.value  = null;
  scanRawText.value     = '';
  showRawOcrPanel.value = false;
  possibleDuplicate.value = null;
  form.value = {
    type: 'expense',
    member_id: '',
    account_id: '',
    category_id: '',
    amount: '',
    transaction_date: todayISO(),
    description: '',
    receipt_url: '',
  };
  showTxModal.value = true;
}

function triggerScan() {
  receiptScannerInput.value?.click();
}

async function onReceiptSelected(event) {
  const file = event.target.files[0];
  if (!file) return;

  isScanning.value = true;
  scanProgress.value = 0;
  scanStatus.value = 'Starting scanner...';
  // Reset scan-specific state
  scanConfidence.value    = null;
  scanRawText.value       = '';
  showRawOcrPanel.value   = false;
  possibleDuplicate.value = null;

  try {
    const data = await scanReceipt(file, (progress, statusMsg) => {
      scanProgress.value = progress;
      if (statusMsg) scanStatus.value = statusMsg;
    });

    // Reset the input so the same file can be selected again
    event.target.value = '';

    // ── Category mapping ──────────────────────────────────────────────────
    let matchedCategoryId = '';
    let categoryConf = 'low';
    const catRec      = data.heuristics.category;
    const expenseCats = categories.value.filter(c => c.type === 'expense');
    const catPatterns = {
      food:          /(makan|minum|food|drink|dining|cafe|kopi|restoran)/,
      groceries:     /(grocer|belanja|sembako|bulanan|pasar|dapur|market)/,
      health:        /(sehat|obat|medis|health|medical|apotek|klinik)/,
      utilities:     /(listrik|air|utilit|bill|telepon|internet|pulsa)/,
      transport:     /(transport|bensin|kendaraan|ojek|gojek|grab|fuel|parkir)/,
      entertainment: /(hiburan|entertain|cinema|bioskop|games|sport)/,
      household:     /(rumah|perabot|elektronik|furniture|hardware)/,
      shopping:      /(belanja|shop|fashion|baju|pakaian|sepatu)/,
    };
    for (const [cat, re] of Object.entries(catPatterns)) {
      if (cat === catRec) {
        const match = expenseCats.find(c => re.test(c.name.toLowerCase()));
        if (match) { 
          matchedCategoryId = match.id; 
          categoryConf = 'high'; 
          break; 
        }
      }
    }
    if (!matchedCategoryId && expenseCats.length > 0) {
      matchedCategoryId = expenseCats[0].id; // Fallback
    }

    // ── Account mapping ───────────────────────────────────────────────────
    let matchedAccountId = '';
    let accountConf = 'low';
    const accRec = data.heuristics.account;
    
    if (accRec === 'cash') {
      const match = accounts.value.find(a => /(cash|tunai|dompet|fisik)/i.test(a.name));
      if (match) { matchedAccountId = match.id; accountConf = 'high'; }
    } else if (accRec === 'wallet') {
      const match = accounts.value.find(a => /(wallet|gopay|ovo|dana|shopee|link|digital|qris|blu)/i.test(a.name));
      if (match) { matchedAccountId = match.id; accountConf = 'high'; }
    } else if (accRec === 'bank') {
      const match = accounts.value.find(a => /(bank|mandiri|bca|bni|bri|cimb|debit|tabungan)/i.test(a.name));
      if (match) { matchedAccountId = match.id; accountConf = 'high'; }
    }
    
    if (!matchedAccountId && accounts.value.length > 0) {
      matchedAccountId = accounts.value[0].id; // Fallback
    }

    // ── Member mapping ────────────────────────────────────────────────────
    let matchedMemberId = '';
    let memberConf = 'low';
    const rawLower = (data.rawText ?? '').toLowerCase();
    if (rawLower) {
      const match = members.value.find(m => rawLower.includes(m.name.toLowerCase()));
      if (match) { matchedMemberId = match.id; memberConf = 'high'; }
    }
    if (!matchedMemberId && members.value.length > 0) {
      matchedMemberId = members.value[0].id; // Fallback
    }

    // ── Duplicate detection ───────────────────────────────────────────────
    if (data.totalAmount && data.date) {
      const fingerprint = `${data.totalAmount}|${data.date}|${(data.merchantName ?? '').toLowerCase()}`;
      const scanDateObj  = new Date(data.date);
      const dupMatch = transactions.value.find(tx => {
        const txDate = new Date(tx.transaction_date);
        const dateDiff = Math.abs(scanDateObj - txDate) / (1000 * 60 * 60 * 24);
        const txFp = `${Math.abs(tx.amount)}|${tx.transaction_date}|${(tx.description ?? '').toLowerCase()}`;
        return txFp === fingerprint || (
          Math.abs(tx.amount) === data.totalAmount &&
          dateDiff <= 1 &&
          (tx.description ?? '').toLowerCase().includes((data.merchantName ?? '').toLowerCase().substring(0, 5))
        );
      });
      if (dupMatch) {
        possibleDuplicate.value = {
          description: dupMatch.description || '-',
          amount: `Rp ${Number(Math.abs(dupMatch.amount)).toLocaleString('id-ID')}`,
          date: dupMatch.transaction_date,
        };
      }
    }

    // ── Receipt preview ───────────────────────────────────────────────────
    if (pendingReceiptPreview.value) URL.revokeObjectURL(pendingReceiptPreview.value);
    pendingReceiptFile.value    = data.imageFile;
    pendingReceiptPreview.value = data.imageFile ? URL.createObjectURL(data.imageFile) : '';

    // ── Store scan meta for UI ────────────────────────────────────────────
    const newConf = data.fieldConfidence ?? {};
    newConf.member = memberConf;
    newConf.account = accountConf;
    newConf.category = categoryConf;
    scanConfidence.value = newConf;
    scanRawText.value    = data.rawText ?? '';

    // ── Auto-fill form & open modal ───────────────────────────────────────
    formError.value             = '';
    editingId.value             = null;
    savedReceiptSignedUrl.value = '';
    receiptUrlToDelete.value    = '';
    pendingReceiptFile.value    = file;
    pendingReceiptPreview.value = URL.createObjectURL(file);
    form.value = {
      type:             'expense',
      member_id:        matchedMemberId,
      account_id:       matchedAccountId,
      category_id:      matchedCategoryId,
      amount:           data.totalAmount || '',
      transaction_date: data.date || todayISO(),
      description:      data.merchantName || '',
      receipt_url:      '',
    };
    showTxModal.value = true;
    toast.success(localeStore.currentLocale === 'id' ? 'Struk berhasil dipindai!' : 'Receipt scanned successfully!');

  } catch (error) {
    console.error('[Scanner] Scan failed:', error);
    toast.error(localeStore.currentLocale === 'id' ? 'Gagal memindai struk.' : 'Failed to parse receipt.');
  } finally {
    isScanning.value = false;
  }
}

async function openEdit(tx) {
  editingId.value = tx.id;
  pendingReceiptFile.value = null;
  pendingReceiptPreview.value = '';
  savedReceiptSignedUrl.value = '';
  receiptUrlToDelete.value = '';
  wasBudgetExceeded.value = false;
  form.value = {
    type: tx.type,
    member_id: tx.member?.id,
    account_id: tx.account?.id,
    category_id: tx.category?.id || '',
    amount: tx.amount,
    transaction_date: tx.transaction_date || tx.transaction_date_raw,
    description: tx.description || '',
    receipt_url: tx.receipt_url || '',
  };
  formError.value = '';
  showTxModal.value = true;
  // Fetch signed URL for existing receipt if present
  if (tx.receipt_url) {
    try {
      savedReceiptSignedUrl.value = await getReceiptSignedUrl(tx.receipt_url);
    } catch { /* non-fatal */ }
  }
}

function openDuplicate(tx) {
  editingId.value = null; // Forces creation instead of editing
  form.value = { 
    type: tx.type, 
    member_id: tx.member?.id || '', 
    account_id: tx.account?.id || '', 
    category_id: tx.category?.id || '', 
    amount: tx.amount, 
    transaction_date: todayISO(), 
    description: tx.description || '' 
  };
  formError.value = '';
  showTxModal.value = true;
}

// Called when user clicks Save button — runs budget pre-check for new expenses
async function saveTransaction() {
  if (saving.value) return;
  formError.value = '';

  // Budget pre-check: only for new expenses with a category
  if (!editingId.value && form.value.type === 'expense' && form.value.category_id) {
    try {
      const now = new Date(form.value.transaction_date);
      const { data } = await budgetService.list({ month: now.getMonth() + 1, year: now.getFullYear() });
      const budgets = data.data || [];
      
      const budget = budgets.find(
        b => String(b.category_id) === String(form.value.category_id) &&
             b.month === now.getMonth() + 1 &&
             b.year  === now.getFullYear()
      );

      if (budget) {
        const totalAfter = budget.spent + Number(form.value.amount);
        if (totalAfter > budget.amount) {
          // Show confirmation dialog instead of saving immediately
          budgetConfirmData.value = {
            category:   budget.category?.name ?? 'this category',
            limitFmt:   fmt(budget.amount),
            spentFmt:   fmt(budget.spent),
            addingFmt:  fmt(form.value.amount),
            totalFmt:   fmt(totalAfter),
            pct:        budget.amount > 0 ? ((totalAfter / budget.amount) * 100).toFixed(1) : '∞',
          };
          wasBudgetExceeded.value = true;
          showBudgetConfirm.value = true;
          return; // Stop here — wait for user to confirm
        }
      }
    } catch { /* ignore budget fetch errors — allow save */ }
  }

  // No budget issue (or editing) — save directly
  await doSaveTransaction();
}

// Actually performs the API save (called after confirmation or when no budget issue)
async function doSaveTransaction() {
  saving.value = true;
  showBudgetConfirm.value = false;
  formError.value = '';
  try {
    const payload = { ...form.value };

    // ── Upload pending receipt image if present ────────────────────────────
    if (pendingReceiptFile.value && authStore.familyId) {
      try {
        const storagePath = await uploadReceipt(pendingReceiptFile.value, authStore.familyId);
        payload.receipt_url = storagePath; // attach atomically
      } catch (uploadErr) {
        console.warn('[Scanner] Pre-upload failed, saving transaction without receipt:', uploadErr);
        toast.error(localeStore.currentLocale === 'id'
          ? 'Foto struk gagal diunggah. Transaksi akan disimpan tanpa foto.'
          : 'Receipt image upload failed. Transaction will be saved without photo.');
      } finally {
        if (pendingReceiptPreview.value) URL.revokeObjectURL(pendingReceiptPreview.value);
        pendingReceiptFile.value    = null;
        pendingReceiptPreview.value = '';
      }
    }

    if (editingId.value) {
      await transactionService.update(editingId.value, payload);
    } else {
      await transactionService.create(payload);
    }

    // Clean up old receipt image from Supabase Storage if user removed/replaced it
    if (receiptUrlToDelete.value) {
      deleteReceipt(receiptUrlToDelete.value).catch(err => {
        console.error('[Storage] Error deleting old receipt image:', err);
      });
      receiptUrlToDelete.value = '';
    }

    toast.success(localeStore.t('common.success'));
    showTxModal.value = false;
    // Reset scan state after successful save
    scanConfidence.value    = null;
    scanRawText.value       = '';
    showRawOcrPanel.value   = false;
    possibleDuplicate.value = null;
    fetchData();
    budgetStore.fetchAlerts();

    // Trigger WhatsApp & PWA Web Push Budget Alert if exceeded
    if (wasBudgetExceeded.value) {
      pushDispatcherService.dispatchPushNotification({
        templateKey: 'BUDGET_EXCEEDED',
        params: {
          category: budgetConfirmData.value.category || 'Category',
          description: form.value.description || 'Expense',
          pct: budgetConfirmData.value.pct || '100'
        },
        url: '/transactions'
      });
      await sendBudgetAlertWhatsApp(budgetConfirmData.value);
      wasBudgetExceeded.value = false;
    }

  } catch (err) {
    showBudgetConfirm.value = false;
    formError.value = err.response?.data?.message || err.message || localeStore.t('common.error');
    toast.error(formError.value);
  } finally {
    saving.value = false;
  }
}

function confirmDelete(tx) {
  deletingTx.value = tx;
  showDeleteModal.value = true;
}

async function doDelete() {
  if (deleting.value) return;
  if (!deletingTx.value) return;
  deleting.value = true;
  const receiptPathToClean = deletingTx.value.receipt_url || '';
  try {
    await transactionService.delete(deletingTx.value.id);
    // Clean up receipt image from storage after transaction row is deleted
    if (receiptPathToClean) {
      deleteReceipt(receiptPathToClean).catch(() => {}); // best-effort, non-fatal
    }
    toast.success(localeStore.t('common.success'));
    showDeleteModal.value = false;
    deletingTx.value = null;
    fetchData();
    budgetStore.fetchAlerts();
  } catch (err) {
    toast.error(err.response?.data?.message || err.message || localeStore.t('common.error'));
  } finally {
    deleting.value = false;
  }
}

function openTransfer() {
  transferForm.value = { member_id: '', from_account_id: '', to_account_id: '', amount: '', transaction_date: todayISO(), description: '' };
  transferError.value = '';
  showTransferModal.value = true;
}

async function saveTransfer() {
  saving.value = true;
  transferError.value = '';
  try {
    await transactionService.transfer(transferForm.value);
    toast.success(localeStore.t('common.success'));
    showTransferModal.value = false;
    fetchData();
  } catch (err) {
    transferError.value = err.response?.data?.message || err.message || localeStore.t('common.error');
    toast.error(transferError.value);
  } finally {
    saving.value = false;
  }
}

async function sendBudgetAlertWhatsApp(alertData) {
  try {
    const { data: family } = await supabase.from('families').select('whatsapp_group_id').eq('id', authStore.familyId).single();
    if (!family || !family.whatsapp_group_id) {
       console.log('No WhatsApp group ID configured for family. Skipping budget alert.');
       return;
    }

    const memberName = members.value.find(m => m.id === form.value.member_id)?.name || 'Someone';

    const message = `🚨 *BUDGET ALERT* 🚨\n*========================*\n\nHi Family! 👋\n${memberName} just logged a new transaction that pushed the *${alertData.category}* category over budget!\n\n💸 *Added:* ${alertData.addingFmt}\n📊 *Total Spent:* ${alertData.totalFmt}\n⛔ *Monthly Limit:* ${alertData.limitFmt}\n\n*⚠️ You are currently at ${alertData.pct}% of this budget!*\n\n*------------------------*\nOpen the FamFin app to review this transaction!`;

    toast.info('Sending Budget Alert to WhatsApp Group...');

    const response = await fetch('https://finance-family-3ac25ba9b522.herokuapp.com/api/notify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': import.meta.env.VITE_WA_API_KEY
      },
      body: JSON.stringify({
        groupId: family.whatsapp_group_id,
        message: message
      })
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Failed to send message');
    
    toast.success('Budget Alert Sent to WhatsApp! 🚀');
  } catch (err) {
    console.error('WhatsApp Budget Alert Error:', err);
    toast.error(`WhatsApp Alert Error: ${err.message}`);
  }
}

const touchStartX = ref(0);
const touchStartY = ref(0);

function onTouchStart(e) {
  touchStartX.value = e.changedTouches[0].screenX;
  touchStartY.value = e.changedTouches[0].screenY;
}

function onTouchEnd(e, tx) {
  const touchEndX = e.changedTouches[0].screenX;
  const touchEndY = e.changedTouches[0].screenY;
  
  const deltaX = touchEndX - touchStartX.value;
  const deltaY = touchEndY - touchStartY.value;
  
  // Only trigger if it's a mostly horizontal swipe (> 80px horizontal, < 50px vertical drift)
  if (Math.abs(deltaX) > 80 && Math.abs(deltaY) < 50) {
    if (deltaX < 0) {
      // Swiped Left -> Delete
      if (getTransactionModule(tx) === 'Manual' || getTransactionModule(tx) === 'Transfer') {
         confirmDelete(tx);
      } else {
         toast.error(localeStore.currentLocale === 'id' ? 'Transaksi otomatis tidak dapat dihapus.' : 'Automated transactions cannot be deleted.');
      }
    } else {
      // Swiped Right -> Edit
      if (getTransactionModule(tx) === 'Manual' || getTransactionModule(tx) === 'Transfer') {
         openEdit(tx);
      } else {
         toast.error(localeStore.currentLocale === 'id' ? 'Transaksi otomatis tidak dapat diedit.' : 'Automated transactions cannot be edited.');
      }
    }
  }
}

const { startTour, startAutoTour } = useTour('transactions');

onMounted(async () => {
  const [, memRes, accRes, catRes] = await Promise.all([
    fetchData(),
    memberService.list(),
    accountService.list(),
    categoryService.list(),
  ]);
  members.value = memRes.data.data;
  accounts.value = accRes.data.data;
  categories.value = catRes.data.data;
  startAutoTour(transactionsTourSteps);
  window.addEventListener('start-transactions-tour', () => startTour(transactionsTourSteps));
});

onUnmounted(() => {
  window.removeEventListener('start-transactions-tour', () => startTour(transactionsTourSteps));
});
</script>
