let ctx: AudioContext | null = null;

function getContext(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function noiseBuffer(audioCtx: AudioContext, seconds: number, decay = 1): AudioBuffer {
  const size = Math.floor(audioCtx.sampleRate * seconds);
  const buffer = audioCtx.createBuffer(1, size, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < size; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / size) ** decay;
  }
  return buffer;
}

/** Soft water splash for a shot that misses. */
export function playMissSound(): void {
  const audioCtx = getContext();
  const now = audioCtx.currentTime;

  const noise = audioCtx.createBufferSource();
  noise.buffer = noiseBuffer(audioCtx, 0.35, 0.6);
  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0.35, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
  const filter = audioCtx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(2200, now);
  filter.frequency.exponentialRampToValueAtTime(600, now + 0.3);
  filter.Q.value = 0.7;
  noise.connect(filter).connect(gain).connect(audioCtx.destination);
  noise.start(now);
  noise.stop(now + 0.35);
}

/** Sharp metallic clang for a shot that hits (but doesn't sink the ship). */
export function playHitSound(): void {
  const audioCtx = getContext();
  const now = audioCtx.currentTime;

  const osc = audioCtx.createOscillator();
  const oscGain = audioCtx.createGain();
  osc.type = "square";
  osc.frequency.setValueAtTime(320, now);
  osc.frequency.exponentialRampToValueAtTime(120, now + 0.15);
  oscGain.gain.setValueAtTime(0.25, now);
  oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
  osc.connect(oscGain).connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + 0.18);

  const noise = audioCtx.createBufferSource();
  noise.buffer = noiseBuffer(audioCtx, 0.15, 0.4);
  const noiseGain = audioCtx.createGain();
  noiseGain.gain.setValueAtTime(0.3, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
  const filter = audioCtx.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = 1500;
  noise.connect(filter).connect(noiseGain).connect(audioCtx.destination);
  noise.start(now);
  noise.stop(now + 0.15);
}

/** Synthesized explosion (low boom + filtered noise crackle) — no audio assets needed. */
export function playSinkSound(): void {
  const audioCtx = getContext();
  const now = audioCtx.currentTime;

  const osc = audioCtx.createOscillator();
  const oscGain = audioCtx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(140, now);
  osc.frequency.exponentialRampToValueAtTime(30, now + 0.6);
  oscGain.gain.setValueAtTime(0.6, now);
  oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
  osc.connect(oscGain).connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + 0.7);

  const noise = audioCtx.createBufferSource();
  noise.buffer = noiseBuffer(audioCtx, 0.4);
  const noiseGain = audioCtx.createGain();
  noiseGain.gain.setValueAtTime(0.5, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
  const filter = audioCtx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 1200;
  noise.connect(filter).connect(noiseGain).connect(audioCtx.destination);
  noise.start(now);
  noise.stop(now + 0.4);
}
