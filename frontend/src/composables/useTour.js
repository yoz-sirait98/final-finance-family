import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { useTourStore } from '../stores/tour';
import { useLocaleStore } from '../stores/locale';

export function useTour(pageKey) {
  const tourStore = useTourStore();
  const localeStore = useLocaleStore();

  function startTour(steps) {
    if (!steps || steps.length === 0) return;

    // Translate step contents dynamically
    const translatedSteps = steps.map(step => {
      const s = { ...step };
      if (s.popover) {
        s.popover = {
          ...s.popover,
          title: localeStore.t(s.popover.title),
          description: localeStore.t(s.popover.description)
        };
      }
      return s;
    });

    const driverObj = driver({
      animate: true,
      showProgress: true,
      showButtons: ['next', 'previous', 'close'],
      nextBtnText: localeStore.t('tours.btn.next'),
      prevBtnText: localeStore.t('tours.btn.prev'),
      doneBtnText: localeStore.t('tours.btn.done'),
      progressText: localeStore.t('tours.progress'),
      popoverClass: 'ff-tour-popover',
      overlayColor: 'rgba(15, 17, 35, 0.75)',
      smoothScroll: true,
      allowClose: true,
      onDestroyed: () => {
        tourStore.markSeen(pageKey);
      },
      steps: translatedSteps,
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
