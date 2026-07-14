const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend/src/pages/ShoppingPage.vue');
let content = fs.readFileSync(filePath, 'utf8');

const targetStr = `    const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    let message = \`*========================*\\n🛒  *NEW SHOPPING LIST*  🛒\\n*========================*\\n\\nHi! 👋 A new shopping list has been created in the *Family Finance App*.\\n\\n📍 *Location:*  \${planPayload.location}\\n👤 *Created by:* \${creatorName}\\n\`;
    if (!isGroup && assignedNamesStr) {
      message += \`🎯 *Assigned to:* \${assignedNamesStr}\\n\`;
    }
    message += \`📅 *Date:*      \${dateStr}\\n\\n*------------------------*\\nOpen the FamFin app to see and manage the items! 🛍️\`;`;

const newStr = `    const isId = localeStore.currentLocale === 'id';
    const dateStr = new Date().toLocaleDateString(isId ? 'id-ID' : 'en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    
    let message = '';
    if (isId) {
      message = \`*========================*\\n🛒  *DAFTAR BELANJA BARU*  🛒\\n*========================*\\n\\nHalo! 👋 Daftar belanja baru telah dibuat.\\n\\n📍 *Lokasi:*  \${planPayload.location}\\n👤 *Dibuat oleh:* \${creatorName}\\n\`;
      if (!isGroup && assignedNamesStr) {
        message += \`🎯 *Ditugaskan ke:* \${assignedNamesStr}\\n\`;
      }
      message += \`📅 *Tanggal:*   \${dateStr}\\n\\n*------------------------*\\nBuka aplikasi FamFin untuk melihat dan mengelola barang belanjaan! 🛍️\`;
    } else {
      message = \`*========================*\\n🛒  *NEW SHOPPING LIST*  🛒\\n*========================*\\n\\nHi! 👋 A new shopping list has been created in the *Family Finance App*.\\n\\n📍 *Location:*  \${planPayload.location}\\n👤 *Created by:* \${creatorName}\\n\`;
      if (!isGroup && assignedNamesStr) {
        message += \`🎯 *Assigned to:* \${assignedNamesStr}\\n\`;
      }
      message += \`📅 *Date:*      \${dateStr}\\n\\n*------------------------*\\nOpen the FamFin app to see and manage the items! 🛍️\`;
    }`;

content = content.replace(targetStr, newStr);

fs.writeFileSync(filePath, content);
console.log('ShoppingPage.vue patched successfully');
