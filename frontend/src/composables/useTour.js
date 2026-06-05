import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { useTourStore } from '../stores/tour';

export function useTour(pageKey) {
  const tourStore = useTourStore();

  function startTour(steps) {
    if (!steps || steps.length === 0) return;

    const driverObj = driver({
      animate: true,
      showProgress: true,
      showButtons: ['next', 'previous', 'close'],
      nextBtnText: 'Next →',
      prevBtnText: '← Back',
      doneBtnText: 'Done ✓',
      progressText: '{{current}} of {{total}}',
      popoverClass: 'ff-tour-popover',
      overlayColor: 'rgba(15, 17, 35, 0.75)',
      smoothScroll: true,
      allowClose: true,
      onDestroyed: () => {
        tourStore.markSeen(pageKey);
      },
      steps: steps,
    });

    driverObj.drive();
    return driverObj;
  }

  function startAutoTour(steps, delay = 600) {
    if (tourStore.hasSeen(pageKey)) return;
    setTimeout(() => startTour(steps), delay);
  }

  return { startTour, startAutoTour };
}
