class AudioService {
  constructor() {
    this.audioCtx = null;
    this.isAlarmPlaying = false;
    this.alarmInterval = null;
  }

  getAudioContext() {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  isSoundEnabled() {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('yjs_scheduler_sound_enabled') !== 'false';
    }
    return true;
  }

  setSoundEnabled(enabled) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('yjs_scheduler_sound_enabled', enabled ? 'true' : 'false');
    }
  }

  /**
   * Plays a single pleasant chime tone
   */
  playChime(frequency = 880, durationMs = 250, gainLevel = 0.3) {
    if (!this.isSoundEnabled()) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);

      gain.gain.setValueAtTime(gainLevel, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + durationMs / 1000);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + durationMs / 1000);
    } catch (e) {
      console.warn('Audio play error (user interaction might be needed):', e);
    }
  }

  /**
   * Starts a repeating pleasant alarm chime sequence
   */
  startAlarm(volume = 0.5) {
    if (this.isAlarmPlaying) return;
    this.isAlarmPlaying = true;

    const playSequence = () => {
      if (!this.isAlarmPlaying) return;
      // Gentle 3-tone arpeggio: C6 (1046.5Hz), E6 (1318.5Hz), G6 (1567.98Hz)
      this.playChime(1046.5, 200, volume * 0.4);
      setTimeout(() => {
        if (this.isAlarmPlaying) this.playChime(1318.5, 200, volume * 0.4);
      }, 150);
      setTimeout(() => {
        if (this.isAlarmPlaying) this.playChime(1567.98, 400, volume * 0.5);
      }, 300);
    };

    playSequence();
    this.alarmInterval = setInterval(playSequence, 2000);
  }

  /**
   * Stops the repeating alarm sound
   */
  stopAlarm() {
    this.isAlarmPlaying = false;
    if (this.alarmInterval) {
      clearInterval(this.alarmInterval);
      this.alarmInterval = null;
    }
  }

  /**
   * Quick confirmation feedback sound
   */
  playConfirmSound() {
    this.playChime(880, 150, 0.2);
    setTimeout(() => {
      this.playChime(1174.66, 200, 0.25);
    }, 100);
  }
}

export const audioService = new AudioService();
