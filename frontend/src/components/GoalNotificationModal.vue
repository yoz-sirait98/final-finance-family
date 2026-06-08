<template>
  <div v-if="show" class="vue-modal-backdrop" @mousedown.self="close">
    <div class="vue-modal">
      <div class="modal-header border-0 pb-0">
        <h5 class="modal-title">
          <i class="bi bi-bell-fill text-warning me-2"></i>Goal Notifications
        </h5>
        <button type="button" class="btn-close" @click="close"></button>
      </div>
      <div class="modal-body">
        <div v-for="(notif, idx) in notifications" :key="idx" class="alert mb-3" :class="notif.type === 'success' ? 'alert-success' : 'alert-warning'">
          <h6 class="alert-heading fw-bold">
            <i class="bi" :class="notif.type === 'success' ? 'bi-trophy-fill text-success' : 'bi-exclamation-circle-fill text-warning'"></i>
            {{ notif.title }}
          </h6>
          <p class="mb-0 small">{{ notif.message }}</p>
        </div>
      </div>
      <div class="modal-footer border-0 pt-0">
        <button class="btn btn-secondary" @click="close">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { goalService } from '../services/goalService';

const show = ref(false);
const notifications = ref([]);

function close() {
  show.value = false;
}

onMounted(async () => {
  try {
    const { data } = await goalService.list();
    if (!data || !data.data) return;

    const todayObj = new Date();
    // Use local date string YYYY-MM-DD
    const todayStr = todayObj.toLocaleDateString('en-CA');
    const activeGoals = data.data.filter(g => g.status === 'active' && g.deadline);

    const newNotifications = [];

    activeGoals.forEach(g => {
      const storageKey = `goal_notified_${g.id}_${todayStr}`;
      if (localStorage.getItem(storageKey)) return; // Already shown today

      const deadlineObj = new Date(g.deadline);
      // Strip time portion to compare just dates
      deadlineObj.setHours(0, 0, 0, 0);
      const currentObj = new Date(todayObj);
      currentObj.setHours(0, 0, 0, 0);

      const diffTime = deadlineObj - currentObj;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const isMet = g.current_amount >= g.target_amount;

      // Target Met -> Only on the deadline day
      if (isMet && diffDays === 0) {
        newNotifications.push({
          type: 'success',
          title: `Target Met: ${g.name}`,
          message: `Congratulations! You reached your target of Rp ${g.target_amount.toLocaleString()} for ${g.name} right on time!`
        });
        localStorage.setItem(storageKey, 'true');
      } 
      // Target Not Met -> Up to 3 days before and 3 days after
      else if (!isMet && diffDays >= -3 && diffDays <= 3) {
        const dayWord = Math.abs(diffDays) === 1 ? 'day' : 'days';
        let timeMsg = '';
        if (diffDays > 0) timeMsg = `is due in ${diffDays} ${dayWord}`;
        else if (diffDays === 0) timeMsg = `is due today`;
        else timeMsg = `was due ${Math.abs(diffDays)} ${dayWord} ago`;

        newNotifications.push({
          type: 'warning',
          title: `Goal Reminder: ${g.name}`,
          message: `Your goal "${g.name}" ${timeMsg}. You have saved Rp ${g.current_amount.toLocaleString()} out of Rp ${g.target_amount.toLocaleString()}.`
        });
        localStorage.setItem(storageKey, 'true');
      }
    });

    if (newNotifications.length > 0) {
      notifications.value = newNotifications;
      show.value = true;
    }

  } catch (e) {
    console.error('Failed to load goals for notifications', e);
  }
});
</script>
