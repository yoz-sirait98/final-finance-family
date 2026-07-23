// ---------------------------------------------------------------------------
// pushDispatcherService.js — Multi-Language PWA Web Push Dispatcher
// ---------------------------------------------------------------------------
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/auth';

/**
 * Dual-language message templates for Push Notifications (Indonesian & English)
 */
export const PUSH_TEMPLATES = {
  // 🛒 Shopping List Templates
  SHOPPING_PLAN_CREATED: {
    id: {
      title: '🛒 Rencana Belanja Baru',
      body: '{creator} membuat rencana belanja baru untuk {location}.',
    },
    en: {
      title: '🛒 New Shopping Plan',
      body: '{creator} created a new shopping plan for {location}.',
    },
  },
  SHOPPING_PLAN_ASSIGNED: {
    id: {
      title: '📝 Tugas Belanja Baru',
      body: 'Anda telah ditugaskan pada rencana belanja {location}.',
    },
    en: {
      title: '📝 New Shopping Assignment',
      body: 'You were assigned to the shopping plan for {location}.',
    },
  },
  SHOPPING_PLAN_DONE: {
    id: {
      title: '✅ Belanja Selesai',
      body: 'Rencana belanja {location} telah ditandai selesai.',
    },
    en: {
      title: '✅ Shopping Completed',
      body: 'Shopping plan for {location} has been marked as done.',
    },
  },
  SHOPPING_PLAN_LOCKED: {
    id: {
      title: '🔒 Belanja Dikunci & Dicatat',
      body: 'Rencana belanja {location} telah dikunci (Total: Rp {amount}).',
    },
    en: {
      title: '🔒 Shopping Locked & Saved',
      body: 'Shopping plan for {location} has been locked (Total: Rp {amount}).',
    },
  },

  // ⚠️ Budget Templates
  BUDGET_WARNING: {
    id: {
      title: '⚠️ Peringatan Anggaran',
      body: 'Kategori {category} telah mencapai {pct}% dari batas bulanan.',
    },
    en: {
      title: '⚠️ Budget Warning',
      body: 'Category {category} has reached {pct}% of its monthly limit.',
    },
  },
  BUDGET_EXCEEDED: {
    id: {
      title: '🚨 Anggaran Terlampaui',
      body: 'Transaksi di {description} menyebabkan anggaran {category} terlampaui ({pct}%).',
    },
    en: {
      title: '🚨 Budget Limit Exceeded',
      body: 'Transaction at {description} pushed {category} over budget ({pct}%).',
    },
  },

  // 💰 Large Expense Template
  LARGE_EXPENSE: {
    id: {
      title: '💸 Pengeluaran Besar',
      body: '{creator} mencatat pengeluaran sebesar Rp {amount} ({description}).',
    },
    en: {
      title: '💸 Large Expense Recorded',
      body: '{creator} logged an expense of Rp {amount} ({description}).',
    },
  },

  // 🎯 Project Pocket / Savings Goal Template
  GOAL_ACHIEVED: {
    id: {
      title: '🎉 Target Menabung Tercapai!',
      body: 'Selamat! Target menabung {goal} telah mencapai 100%!',
    },
    en: {
      title: '🎉 Saving Goal Reached!',
      body: 'Congratulations! Saving goal {goal} has reached 100%!',
    },
  },
};

/**
 * Format dynamic parameters inside notification body text
 */
function interpolateTemplate(templateStr, params = {}) {
  if (!templateStr) return '';
  return templateStr.replace(/\{(\w+)\}/g, (_, key) => {
    return params[key] !== undefined ? params[key] : `{${key}}`;
  });
}

export const pushDispatcherService = {
  /**
   * Dispatch a localized push notification to active family subscribers
   * @param {Object} opts
   * @param {string} opts.templateKey - Key from PUSH_TEMPLATES (e.g., 'SHOPPING_PLAN_LOCKED')
   * @param {Object} opts.params - Dynamic interpolation variables (e.g. { location: 'Indomaret', amount: '150.000' })
   * @param {string} [opts.targetUserId] - Optional specific user_id to target (if omitted, sends to family members)
   * @param {string} [opts.url] - Deep-link target route (e.g., '/shopping/123')
   * @param {boolean} [opts.excludeSelf=true] - Exclude current logged in user from receiving the push
   */
  async dispatchPushNotification({ templateKey, params = {}, targetUserId = null, url = '/', excludeSelf = true }) {
    try {
      const authStore = useAuthStore();
      const currentUserId = authStore.user?.id;
      const familyId = authStore.familyId;

      if (!familyId) return;

      const templateGroup = PUSH_TEMPLATES[templateKey];
      if (!templateGroup) {
        console.warn(`[PushDispatcher] Unknown templateKey: ${templateKey}`);
        return;
      }

      // Query active subscriptions for family
      let query = supabase.from('push_subscriptions').select('*').eq('family_id', familyId);
      if (targetUserId) {
        query = query.eq('user_id', targetUserId);
      }

      const { data: subscriptions, error } = await query;
      if (error) {
        console.error('[PushDispatcher] Error fetching subscriptions:', error);
        return;
      }

      if (!subscriptions || subscriptions.length === 0) return;

      // Filter out current user if excludeSelf is true
      const eligibleSubs = subscriptions.filter(sub => !excludeSelf || sub.user_id !== currentUserId);

      for (const sub of eligibleSubs) {
        // Select recipient's language choice ('id' or 'en', default to 'en')
        const userLocale = (sub.locale === 'id') ? 'id' : 'en';
        const localizedTemplate = templateGroup[userLocale] || templateGroup.en;

        const title = interpolateTemplate(localizedTemplate.title, params);
        const body = interpolateTemplate(localizedTemplate.body, params);

        const pushPayload = {
          title,
          body,
          icon: '/favicon.svg',
          data: { url },
          tag: `famfin-${templateKey.toLowerCase()}-${Date.now()}`,
        };

        // If active on client device, trigger via Service Worker registration directly
        if ('serviceWorker' in navigator && Notification.permission === 'granted') {
          const reg = await navigator.serviceWorker.ready;
          reg.showNotification(title, {
            body,
            icon: '/favicon.svg',
            data: { url },
            tag: pushPayload.tag,
            vibrate: [100, 50, 100],
          }).catch(err => console.warn('[PushDispatcher] Direct SW notification error:', err));
        }
      }
    } catch (e) {
      console.error('[PushDispatcher] Error dispatching push notification:', e);
    }
  },
};
