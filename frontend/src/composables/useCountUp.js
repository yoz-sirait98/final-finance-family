import { ref, watch, onMounted } from 'vue';

export function useCountUp(targetValueRef, durationMs = 1500) {
  const displayValue = ref(0);
  
  function easeOutExpo(x) {
    return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
  }

  function animate(target) {
    if (!target) {
      displayValue.value = 0;
      return;
    }
    
    let startTime = null;
    const startValue = displayValue.value;
    const changeInValue = target - startValue;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      
      const percent = Math.min(progress / durationMs, 1);
      const easedPercent = easeOutExpo(percent);
      
      displayValue.value = startValue + (changeInValue * easedPercent);
      
      if (progress < durationMs) {
        requestAnimationFrame(step);
      } else {
        displayValue.value = target; // Ensure exact finish
      }
    }
    requestAnimationFrame(step);
  }

  watch(targetValueRef, (newVal) => {
    animate(newVal);
  }, { immediate: false });
  
  onMounted(() => {
    animate(targetValueRef.value);
  });

  return displayValue;
}
