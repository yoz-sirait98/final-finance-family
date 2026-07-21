const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend/src/pages/TransactionsPage.vue');
let content = fs.readFileSync(filePath, 'utf8');

const targetStr = `    const memberName = members.value.find(m => m.id === form.value.member_id)?.name || 'Someone';

    const message = \`🚨 *BUDGET ALERT* 🚨\\n*========================*\\n\\nHi Family! 👋\\n\${memberName} just logged a new transaction that pushed the *\${alertData.category}* category over budget!\\n\\n💸 *Added:* \${alertData.addingFmt}\\n📊 *Total Spent:* \${alertData.totalFmt}\\n⛔ *Monthly Limit:* \${alertData.limitFmt}\\n\\n*⚠️ You are currently at \${alertData.pct}% of this budget!*\\n\\n*------------------------*\\nOpen the FamFin app to review this transaction!\`;`;

const newStr = `    const memberName = members.value.find(m => m.id === form.value.member_id)?.name || 'Someone';

    const isId = localeStore.currentLocale === 'id';
    let message = '';
    
    if (isId) {
      message = \`🚨 *PERINGATAN ANGGARAN* 🚨\\n*========================*\\n\\nHalo Keluarga! 👋\\n\${memberName} baru saja mencatat transaksi baru yang membuat kategori *\${alertData.category}* melebihi batas anggaran!\\n\\n💸 *Ditambahkan:* \${alertData.addingFmt}\\n📊 *Total Pengeluaran:* \${alertData.totalFmt}\\n⛔ *Batas Bulanan:* \${alertData.limitFmt}\\n\\n*⚠️ Saat ini pengeluaran mencapai \${alertData.pct}% dari anggaran!*\\n\\n*------------------------*\\nBuka aplikasi FamFin untuk melihat detail transaksi ini!\`;
    } else {
      message = \`🚨 *BUDGET ALERT* 🚨\\n*========================*\\n\\nHi Family! 👋\\n\${memberName} just logged a new transaction that pushed the *\${alertData.category}* category over budget!\\n\\n💸 *Added:* \${alertData.addingFmt}\\n📊 *Total Spent:* \${alertData.totalFmt}\\n⛔ *Monthly Limit:* \${alertData.limitFmt}\\n\\n*⚠️ You are currently at \${alertData.pct}% of this budget!*\\n\\n*------------------------*\\nOpen the FamFin app to review this transaction!\`;
    }`;

content = content.replace(targetStr, newStr);

fs.writeFileSync(filePath, content);
console.log('TransactionsPage.vue patched successfully');
