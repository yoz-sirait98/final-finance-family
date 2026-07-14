const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend/src/pages/ShoppingDetailPage.vue');
let content = fs.readFileSync(filePath, 'utf8');

if (!content.includes("import { formatCurrency } from '../utils/format';")) {
    content = content.replace("import { supabase } from '../lib/supabase';", "import { supabase } from '../lib/supabase';\nimport { formatCurrency } from '../utils/format';");
}

const processCheckoutRegex = /async function processCheckout\(\) \{[\s\S]*?isCheckingOut\.value = false;\s*\n*\s*\}/;

const newCheckout = "async function processCheckout() {\n" +
"  isCheckingOut.value = true;\n" +
"  try {\n" +
"    await shoppingPlanService.checkout(planId, {\n" +
"      member_id: checkoutForm.value.member_id,\n" +
"      account_id: checkoutForm.value.account_id,\n" +
"      category_id: checkoutForm.value.category_id,\n" +
"      transaction_date: checkoutForm.value.transaction_date\n" +
"    });\n" +
"    \n" +
"    await sendCheckoutNotification();\n" +
"\n" +
"    toast.success('Checkout successful!');\n" +
"    showCheckoutModal.value = false;\n" +
"    fetchPlan();\n" +
"  } catch (e) {\n" +
"    toast.error('Checkout failed');\n" +
"  } finally {\n" +
"    isCheckingOut.value = false;\n" +
"  }\n" +
"}\n" +
"\n" +
"async function sendCheckoutNotification() {\n" +
"  try {\n" +
"    const { data: family } = await supabase.from('families').select('whatsapp_group_id').eq('id', authStore.familyId).single();\n" +
"    if (!family || !family.whatsapp_group_id) return;\n" +
"    \n" +
"    const buyer = members.value.find(m => m.id === checkoutForm.value.member_id);\n" +
"    const buyerName = buyer ? buyer.name : 'Unknown';\n" +
"    const loc = plan.value?.location || 'Unknown';\n" +
"    const isId = localeStore.currentLocale === 'id';\n" +
"    const dateStr = new Date().toLocaleDateString(isId ? 'id-ID' : 'en-GB', { day: '2-digit', month: 'short', year: 'numeric' });\n" +
"    \n" +
"    let message = '';\n" +
"    if (isId) {\n" +
"      message = \"*========================*\\n🛍️  *BELANJA SELESAI*  🛍️\\n*========================*\\n\\nHore! 👋 Daftar belanja telah selesai dan dicatat.\\n\\n📍 *Lokasi:* \" + loc + \"\\n👤 *Dibeli oleh:* \" + buyerName + \"\\n\\n*Daftar Belanjaan:*\\n\";\n" +
"    } else {\n" +
"      message = \"*========================*\\n🛍️  *SHOPPING COMPLETED*  🛍️\\n*========================*\\n\\nGreat news! A shopping trip has just been completed and logged.\\n\\n📍 *Location:* \" + loc + \"\\n👤 *Bought by:* \" + buyerName + \"\\n\\n*Items Purchased:*\\n\";\n" +
"    }\n" +
"\n" +
"    items.value.forEach(item => {\n" +
"      const priceStr = formatCurrency(parseFloat(item.price) || 0);\n" +
"      message += \"✅ \" + item.name + \" - \" + priceStr + \"\\n\";\n" +
"    });\n" +
"\n" +
"    const totalStr = formatCurrency(totalAmount.value);\n" +
"    \n" +
"    if (isId) {\n" +
"      message += \"\\n*------------------------*\\n💵 *Total Keseluruhan:* \" + totalStr + \"\\n*------------------------*\";\n" +
"    } else {\n" +
"      message += \"\\n*------------------------*\\n💵 *Grand Total:* \" + totalStr + \"\\n*------------------------*\";\n" +
"    }\n" +
"\n" +
"    await fetch('https://finance-family-3ac25ba9b522.herokuapp.com/api/notify', {\n" +
"      method: 'POST',\n" +
"      headers: { 'Content-Type': 'application/json', 'x-api-key': import.meta.env.VITE_WA_API_KEY },\n" +
"      body: JSON.stringify({ message: message, groupId: family.whatsapp_group_id })\n" +
"    });\n" +
"  } catch (err) {\n" +
"    console.error('Failed to send WA checkout notif', err);\n" +
"  }\n" +
"}\n";

if (processCheckoutRegex.test(content) && !content.includes('sendCheckoutNotification')) {
    content = content.replace(processCheckoutRegex, newCheckout);
    fs.writeFileSync(filePath, content);
    console.log('ShoppingDetailPage.vue patched successfully!');
} else {
    console.log('Regex failed to match or already patched.');
}
