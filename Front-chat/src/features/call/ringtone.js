let audioCtx = null;
let intervalId = null;

function beep(ctx, frequency, duration) {
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = "sine";
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0.0001, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
  oscillator.connect(gain).connect(ctx.destination);
  oscillator.start();
  oscillator.stop(ctx.currentTime + duration);
}

export function startRingtone(pattern = "incoming") {
  stopRingtone();
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return;
  audioCtx = new Ctx();

  const ring =
    pattern === "incoming"
      ? () => {
          beep(audioCtx, 880, 0.3);
          setTimeout(() => beep(audioCtx, 660, 0.3), 350);
        }
      : () => beep(audioCtx, 440, 0.5);

  ring();
  intervalId = setInterval(ring, pattern === "incoming" ? 1400 : 2000);
}

export function stopRingtone() {
  clearInterval(intervalId);
  intervalId = null;
  audioCtx?.close();
  audioCtx = null;
}
