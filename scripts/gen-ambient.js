/**
 * Generates seamless looping ambient noise tracks (white / brown / pink) as
 * 16-bit PCM WAV files. These are synthesized (no external assets / licenses).
 * Run with: node scripts/gen-ambient.js
 *
 * Outputs into assets/sounds/ambient/:
 *   white.wav  brown.wav  pink.wav
 */
const fs = require('fs');
const path = require('path');

const sampleRate = 44100;
const seconds = 6;
const L = sampleRate * seconds; // loop length in samples
const F = Math.floor(sampleRate * 0.04); // crossfade length (~40ms)
const PEAK = 0.6; // normalize target

function whiteGen() {
  return () => Math.random() * 2 - 1;
}

function brownGen() {
  let last = 0;
  return () => {
    const w = Math.random() * 2 - 1;
    last = (last + 0.02 * w) / 1.02; // leaky integrator avoids DC runaway
    return last * 3.5;
  };
}

function pinkGen() {
  // Paul Kellet's economy pink-noise filter.
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  return () => {
    const w = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + w * 0.0555179;
    b1 = 0.99332 * b1 + w * 0.0750759;
    b2 = 0.969 * b2 + w * 0.153852;
    b3 = 0.8665 * b3 + w * 0.3104856;
    b4 = 0.55 * b4 + w * 0.5329522;
    b5 = -0.7616 * b5 - w * 0.016898;
    const out = b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362;
    b6 = w * 0.115926;
    return out * 0.11;
  };
}

function buildLoop(gen) {
  // Generate L + F samples, then crossfade the head with the post-tail so the
  // wrap point (sample L-1 -> 0) is continuous (no click), using equal power.
  const g = new Float64Array(L + F);
  for (let i = 0; i < g.length; i++) g[i] = gen();

  const out = new Float64Array(L);
  for (let i = 0; i < L; i++) out[i] = g[i];
  for (let j = 0; j < F; j++) {
    const t = j / F;
    const wHead = Math.sin((t * Math.PI) / 2);
    const wTail = Math.cos((t * Math.PI) / 2);
    out[j] = g[j] * wHead + g[L + j] * wTail;
  }

  let peak = 0;
  for (let i = 0; i < L; i++) peak = Math.max(peak, Math.abs(out[i]));
  const norm = peak > 0 ? PEAK / peak : 1;
  for (let i = 0; i < L; i++) out[i] *= norm;
  return out;
}

function writeWav(samples, file) {
  const dataLength = samples.length * 2;
  const buffer = Buffer.alloc(44 + dataLength);
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataLength, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(1, 22); // mono
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataLength, 40);
  let offset = 44;
  for (const s of samples) {
    const c = Math.max(-1, Math.min(1, s));
    buffer.writeInt16LE(Math.round(c * 32767), offset);
    offset += 2;
  }
  fs.writeFileSync(file, buffer);
  console.log('  ✓', path.basename(file), `(${(buffer.length / 1024).toFixed(0)} KB)`);
}

function main() {
  const outDir = path.join(__dirname, '..', 'assets', 'sounds', 'ambient');
  fs.mkdirSync(outDir, { recursive: true });
  console.log('Generating ambient loops →', outDir);
  writeWav(buildLoop(whiteGen()), path.join(outDir, 'white.wav'));
  writeWav(buildLoop(brownGen()), path.join(outDir, 'brown.wav'));
  writeWav(buildLoop(pinkGen()), path.join(outDir, 'pink.wav'));
  console.log('Done.');
}

main();
