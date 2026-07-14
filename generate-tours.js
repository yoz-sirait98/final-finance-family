const fs = require('fs');
const path = require('path');

const tourDir = path.join(__dirname, 'frontend/src/tours');

const tours = {
  calendarTour: `export const calendarTourSteps = [
  { element: '#tour-calendar-header', popover: { title: 'tours.calendar.header.title', description: 'tours.calendar.header.description', side: 'bottom', align: 'start' } },
  { element: '#tour-calendar-add-btn', popover: { title: 'tours.calendar.add.title', description: 'tours.calendar.add.description', side: 'left', align: 'start' } },
  { element: '#tour-calendar-grid', popover: { title: 'tours.calendar.grid.title', description: 'tours.calendar.grid.description', side: 'top', align: 'center' } },
];`,
  shoppingTour: `export const shoppingTourSteps = [
  { element: '#tour-shopping-header', popover: { title: 'tours.shopping.header.title', description: 'tours.shopping.header.description', side: 'bottom', align: 'start' } },
  { element: '#tour-shopping-ai-btn', popover: { title: 'tours.shopping.ai.title', description: 'tours.shopping.ai.description', side: 'left', align: 'start' } },
  { element: '#tour-shopping-add-btn', popover: { title: 'tours.shopping.add.title', description: 'tours.shopping.add.description', side: 'left', align: 'start' } },
];`,
  shoppingDetailTour: `export const shoppingDetailTourSteps = [
  { element: '#tour-sd-header', popover: { title: 'tours.shoppingDetail.header.title', description: 'tours.shoppingDetail.header.description', side: 'bottom', align: 'start' } },
  { element: '#tour-sd-add-btn', popover: { title: 'tours.shoppingDetail.add.title', description: 'tours.shoppingDetail.add.description', side: 'bottom', align: 'start' } },
  { element: '#tour-sd-split-btn', popover: { title: 'tours.shoppingDetail.split.title', description: 'tours.shoppingDetail.split.description', side: 'left', align: 'start' } },
  { element: '#tour-sd-buy-btn', popover: { title: 'tours.shoppingDetail.buy.title', description: 'tours.shoppingDetail.buy.description', side: 'left', align: 'start' } },
];`,
  categoriesTour: `export const categoriesTourSteps = [
  { element: '#tour-categories-header', popover: { title: 'tours.categories.header.title', description: 'tours.categories.header.description', side: 'bottom', align: 'start' } },
  { element: '#tour-categories-add-btn', popover: { title: 'tours.categories.add.title', description: 'tours.categories.add.description', side: 'left', align: 'start' } },
  { element: '#tour-categories-list', popover: { title: 'tours.categories.list.title', description: 'tours.categories.list.description', side: 'top', align: 'center' } },
];`,
  projectsTour: `export const projectsTourSteps = [
  { element: '#tour-projects-header', popover: { title: 'tours.projects.header.title', description: 'tours.projects.header.description', side: 'bottom', align: 'start' } },
  { element: '#tour-projects-add-btn', popover: { title: 'tours.projects.add.title', description: 'tours.projects.add.description', side: 'left', align: 'start' } },
  { element: '#tour-projects-fund-btn', popover: { title: 'tours.projects.fund.title', description: 'tours.projects.fund.description', side: 'bottom', align: 'center' } },
];`,
  membersTour: `export const membersTourSteps = [
  { element: '#tour-members-header', popover: { title: 'tours.members.header.title', description: 'tours.members.header.description', side: 'bottom', align: 'start' } },
  { element: '#tour-members-add-btn', popover: { title: 'tours.members.add.title', description: 'tours.members.add.description', side: 'left', align: 'start' } },
  { element: '#tour-members-permissions', popover: { title: 'tours.members.permissions.title', description: 'tours.members.permissions.description', side: 'top', align: 'center' } },
];`,
  settingsTour: `export const settingsTourSteps = [
  { element: '#tour-settings-header', popover: { title: 'tours.settings.header.title', description: 'tours.settings.header.description', side: 'bottom', align: 'start' } },
  { element: '#tour-settings-currency', popover: { title: 'tours.settings.currency.title', description: 'tours.settings.currency.description', side: 'bottom', align: 'start' } },
  { element: '#tour-settings-danger', popover: { title: 'tours.settings.danger.title', description: 'tours.settings.danger.description', side: 'top', align: 'start' } },
];`,
  aiTour: `export const aiTourSteps = [
  { element: '#tour-ai-header', popover: { title: 'tours.ai.header.title', description: 'tours.ai.header.description', side: 'bottom', align: 'start' } },
  { element: '#tour-ai-clear-btn', popover: { title: 'tours.ai.clear.title', description: 'tours.ai.clear.description', side: 'left', align: 'start' } },
  { element: '#tour-ai-prompt', popover: { title: 'tours.ai.prompt.title', description: 'tours.ai.prompt.description', side: 'top', align: 'center' } },
];`,
};

for (const [filename, content] of Object.entries(tours)) {
  fs.writeFileSync(path.join(tourDir, filename + '.js'), content);
}
console.log('Created 8 new tour files!');
