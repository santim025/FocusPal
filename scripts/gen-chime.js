// Generates a short, pleasant two-tone chime as a 16-bit PCM WAV file.
// Run once with: node scripts/gen-chime.js
const fs = require('fs');
const path = require('path');

const sampleRate = 44100;
const channels = 1;
const bitsPerSample = 16;

// Two notes (a gentle "ding-dong"): A5 then E6.
const notes = [
  { freq: 880.0, duration: 0.18 },
  { freq: 1318.51, duration: 0.42 },
];

const samples = [];
for (const note of notes) {
  const count = Math.floor(sampleRate * note.duration);
  for (let i = 0; i < count; i++) {
    const t = i / sampleRate;
    // Exponential decay envelope for a bell-like fade out.
    const env = Math.exp(-4.5 * (i / count));
    const value = Math.sin(2 * Math.PI * note.freq * t) * env * 0.55;
    samples.push(value);
  }
}

const dataLength = samples.length * (bitsPerSample / 8);
const buffer = Buffer.alloc(44 + dataLength);

buffer.write('RIFF', 0);
buffer.writeUInt32LE(36 + dataLength, 4);
buffer.write('WAVE', 8);
buffer.write('fmt ', 12);
buffer.writeUInt32LE(16, 16);
buffer.writeUInt16LE(1, 20); // PCM
buffer.writeUInt16LE(channels, 22);
buffer.writeUInt32LE(sampleRate, 24);
buffer.writeUInt32LE((sampleRate * channels * bitsPerSample) / 8, 28);
buffer.writeUInt16LE((channels * bitsPerSample) / 8, 32);
buffer.writeUInt16LE(bitsPerSample, 34);
buffer.write('data', 36);
buffer.writeUInt32LE(dataLength, 40);

let offset = 44;
for (const s of samples) {
  const clamped = Math.max(-1, Math.min(1, s));
  buffer.writeInt16LE(Math.round(clamped * 32767), offset);
  offset += 2;
}

const outDir = path.join(__dirname, '..', 'assets', 'sounds');
fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, 'chime.wav');
fs.writeFileSync(outPath, buffer);
console.log(`Wrote ${outPath} (${buffer.length} bytes)`);
