const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend/src/pages/ShoppingDetailPage.vue');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add formatCurrency import
content = content.replace("import { supabase } from '../lib/supabase';", "import { supabase } from '../lib/supabase';\nimport { formatCurrency } from '../utils/format';");

// 2. Replace processCheckout and add sendCheckoutNotification
const oldCheckout = `async function processCheckout() {
  isCheckingOut.value = true;
  try {
    await shoppingPlanService.checkout(planId, {
      member_id: checkoutForm.value.member_id,
      account_id: checkoutForm.value.account_id,
      category_id: checkoutForm.value.category_id,
      transaction_date: checkoutForm.value.transaction_date
    });
    toast.success('Checkout successful!');
    showCheckoutModal.value = false;
    fetchPlan();
  } catch (e) {
    toast.error('Checkout failed');
  } finally {
    isCheckingOut.value = false;
  }
}`;

const newCheckout = `async function processCheckout() {
  isCheckingOut.value = true;
  try {
    await shoppingPlanService.checkout(planId, {
      member_id: checkoutForm.value.member_id,
      account_id: checkoutForm.value.account_id,
      category_id: checkoutForm.value.category_id,
      transaction_date: checkoutForm.value.transaction_date
    });
    
    await sendCheckoutNotification();

    toast.success('Checkout successful!');
    showCheckoutModal.value = false;
    fetchPlan();
  } catch (e) {
    toast.error('Checkout failed');
  } finally {
    isCheckingOut.value = false;
  }
}

async function sendCheckoutNotification() {
  try {
    const { data: family } = await supabase.from('families').select('whatsapp_group_id').eq('id', authStore.familyId).single();
    if (!family || !family.whatsapp_group_id) return;
    
    const buyer = members.value.find(m => m.id === checkoutForm.value.member_id);
    const buyerName = buyer ? buyer.name : 'Unknown';
    const loc = plan.value?.location || 'Unknown';
    const isId = localeStore.currentLocale === 'id';
    const dateStr = new Date().toLocaleDateString(isId ? 'id-ID' : 'en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    
    let message = '';
    if (isId) {
      message = \`*========================*\\n🛍️  *BELANJA SELESAI*  🛍️\\n*========================*\\n\\nHore! 👋 Daftar belanja telah selesai dan dicatat.\\n\\n📍 *Lokasi:* \${loc}\\n👤 *Dibeli oleh:* \${buyerName}\\n\\n*Daftar Belanjaan:*\\n\`;
    } else {
      message = \`*========================*\\n🛍️  *SHOPPING COMPLETED*  🛍️\\n*========================*\\n\\nGreat news! A shopping trip has just been completed and logged.\\n\\n📍 *Location:* \${loc}\\n👤 *Bought by:* \${buyerName}\\n\\n*Items Purchased:*\\n\`;
    }

    items.value.forEach(item => {
      const priceStr = formatCurrency(parseFloat(item.price) || 0);
      message += \`✅ \${item.name} - \${priceStr}\\n\`;
    });

    const totalStr = formatCurrency(totalAmount.value);
    
    if (isId) {
      message += \`\\n*------------------------*\\n💵 *Total Keseluruhan:* \${totalStr}\\n*------------------------*\`;
    } else {
      message += \`\\n*------------------------*\\n💵 *Grand Total:* \${totalStr}\\n*------------------------*\`;
    }

    await fetch('https://finance-family-3ac25ba9b522.herokuapp.com/api/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': import.meta.env.VITE_WA_API_KEY },
      body: JSON.stringify({ message: message, groupId: family.whatsapp_group_id })
    });
  } catch (err) {
    console.error('Failed to send WA checkout notif', err);
  }
}`;

content = content.replace(oldCheckout, newCheckout);

fs.writeFileSync(filePath, content);
console.log('ShoppingDetailPage.vue patched successfully');
