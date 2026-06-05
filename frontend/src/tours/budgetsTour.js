export const budgetsTourSteps = [
  {
    element: '#tour-budgets-header',
    popover: {
      title: '🎯 Budgets',
      description: 'Set monthly spending limits for each expense category. The app will warn you when you\'re getting close to or exceeding your budget.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '#tour-budgets-add-btn',
    popover: {
      title: '➕ Create a Budget',
      description: 'Click here to assign a monthly budget limit to any expense category. You can set different amounts for different months.',
      side: 'left',
      align: 'start',
    },
  },
  {
    element: '#tour-budgets-list',
    popover: {
      title: '📊 Budget Cards',
      description: 'Each card shows a category\'s budget limit, how much has been spent, and the remaining amount. Colors change from green → yellow → red as you approach the limit.',
      side: 'top',
      align: 'center',
    },
  },
  {
    element: '#tour-bell-icon',
    popover: {
      title: '🔔 Budget Alerts',
      description: 'When any budget exceeds its limit, a red badge appears on the bell icon here. Click it to see all over-budget categories.',
      side: 'bottom',
      align: 'end',
    },
  },
];
