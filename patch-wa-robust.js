const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend/src/pages/ShoppingPage.vue');
let content = fs.readFileSync(filePath, 'utf8');

// We will split the file using a known unique string
const startMarker = "    const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });";
const endMarker = "    const apiPayload = { message: message };";

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
    const newBlock = `    const isId = localeStore.currentLocale === 'id';
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
    }

`;

    content = content.substring(0, startIndex) + newBlock + content.substring(endIndex);
    
    // Check if localeStore is imported in ShoppingPage.vue
    if (!content.includes('import { useLocaleStore } from')) {
        content = content.replace("import { useToastStore } from '../stores/toast';", "import { useToastStore } from '../stores/toast';\\nimport { useLocaleStore } from '../stores/locale';");
        
        // Also inject instantiation
        content = content.replace("const toast = useToastStore();", "const toast = useToastStore();\\nconst localeStore = useLocaleStore();");
    }
    
    fs.writeFileSync(filePath, content);
    console.log('Successfully patched ShoppingPage.vue with slicing approach!');
} else {
    console.log('Markers not found!');
    console.log('Start marker found?', startIndex !== -1);
    console.log('End marker found?', endIndex !== -1);
}
