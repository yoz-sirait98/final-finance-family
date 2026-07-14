const fs = require('fs');
const path = require('path');

const pages = [
  { file: 'CalendarPage.vue', name: 'calendar', headerId: 'tour-calendar-header' },
  { file: 'ShoppingPage.vue', name: 'shopping', headerId: 'tour-shopping-header' },
  { file: 'ShoppingDetailPage.vue', name: 'shoppingDetail', headerId: 'tour-sd-header' },
  { file: 'CategoriesPage.vue', name: 'categories', headerId: 'tour-categories-header' },
  { file: 'ProjectPocketsPage.vue', name: 'projects', headerId: 'tour-projects-header' },
  { file: 'MembersPage.vue', name: 'members', headerId: 'tour-members-header' },
  { file: 'SettingsPage.vue', name: 'settings', headerId: 'tour-settings-header' },
  { file: 'AiPage.vue', name: 'ai', headerId: 'tour-ai-header' }
];

for (const p of pages) {
  const filePath = path.join(__dirname, 'frontend/src/pages', p.file);
  if (!fs.existsSync(filePath)) continue;

  let content = fs.readFileSync(filePath, 'utf8');

  // Skip if already patched
  if (content.includes(`useTour('${p.name}')`)) {
    console.log(`Skipping ${p.file} - already patched.`);
    continue;
  }

  // 1. Add ID to header
  content = content.replace(/class="page-header/g, `id="${p.headerId}" class="page-header`);

  // 2. Add ID to add button if exists
  content = content.replace(/class="btn btn-primary-gradient"/, `id="tour-${p.name}-add-btn" class="btn btn-primary-gradient"`);

  // 3. Imports
  const importStr = `import { useTour } from '../composables/useTour';\nimport { ${p.name}TourSteps } from '../tours/${p.name}Tour';\n`;
  content = content.replace('<script setup>', `<script setup>\n${importStr}`);

  // 4. Setup hook
  const setupStr = `\nconst { startAutoTour, startTour } = useTour('${p.name}');\nconst handleTour = () => startTour(${p.name}TourSteps);\n`;
  // Insert after the last import
  const importsEnd = content.lastIndexOf('import ');
  const nextLine = content.indexOf('\\n', importsEnd) !== -1 ? content.indexOf('\\n', importsEnd) : content.indexOf(';', importsEnd);
  
  if (nextLine !== -1) {
    // hacky fallback, let's just insert after first block of imports
    const match = content.match(/import .*?;?\n/g);
    if (match) {
      const lastMatch = match[match.length - 1];
      content = content.replace(lastMatch, lastMatch + setupStr);
    }
  }

  // 5. onMounted
  const onMountedCode = `  startAutoTour(${p.name}TourSteps);\n  window.addEventListener('start-${p.name}-tour', handleTour);\n`;
  if (content.includes('onMounted(async () => {')) {
    content = content.replace('onMounted(async () => {', `onMounted(async () => {\n${onMountedCode}`);
  } else if (content.includes('onMounted(() => {')) {
    content = content.replace('onMounted(() => {', `onMounted(() => {\n${onMountedCode}`);
  } else {
    // Add onMounted entirely
    content = content.replace('</script>', `\nonMounted(() => {\n${onMountedCode}});\n</script>`);
    if (!content.includes('import {') || !content.includes('onMounted')) {
        content = content.replace('import {', 'import { onMounted, onUnmounted,');
    }
  }

  // 6. onUnmounted
  const onUnmountedCode = `  window.removeEventListener('start-${p.name}-tour', handleTour);\n`;
  if (content.includes('onUnmounted(() => {')) {
    content = content.replace('onUnmounted(() => {', `onUnmounted(() => {\n${onUnmountedCode}`);
  } else {
    // Add onUnmounted entirely
    content = content.replace('</script>', `\nonUnmounted(() => {\n${onUnmountedCode}});\n</script>`);
  }

  fs.writeFileSync(filePath, content);
  console.log(`Patched ${p.file}`);
}
