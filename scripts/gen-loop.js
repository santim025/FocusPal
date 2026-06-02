/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Turns raw ambience tracks (from `mmx music generate`, etc.) into seamless
 * loops. The trick: take the track's tail and crossfade it back over its head,
 * then place that blend before the remaining middle. The result wraps end->start
 * with no audible click.
 *
 *   raw clip  C[0..L]
 *   head = C[0..d]   mid = C[d..L-d]   tail = C[L-d..L]
 *   xf   = crossfade(tail -> head)      (length d)
 *   loop = xf + mid                     (length L-d, loops seamlessly)
 *
 * Usage:  node ./scripts/gen-loop.js            (process every file in ambient-src/)
 *         node ./scripts/gen-loop.js rain ocean (only those, by basename)
 */
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ffmpeg = require('ffmpeg-static');
const ffprobe = require('ffprobe-static').path;

const SRC_DIR = path.resolve(__dirname, '..', 'ambient-src');
const OUT_DIR = path.resolve(__dirname, '..', 'assets', 'sounds', 'ambient');

// Max crossfade length in seconds (capped per-clip so it never exceeds L/3).
const MAX_XFADE = 4;
const BITRATE = '192k';

function probeDuration(file) {
  const out = execFileSync(ffprobe, [
    '-v', 'error',
    '-show_entries', 'format=duration',
    '-of', 'default=noprint_wrappers=1:nokey=1',
    file,
  ]);
  return parseFloat(out.toString().trim());
}

function buildLoop(input, output, L) {
  const d = Math.min(MAX_XFADE, L / 3);
  const fix = (n) => n.toFixed(3);
  const filter = [
    `[0:a]atrim=0:${fix(d)},asetpts=PTS-STARTPTS[head]`,
    `[0:a]atrim=${fix(d)}:${fix(L - d)},asetpts=PTS-STARTPTS[mid]`,
    `[0:a]atrim=${fix(L - d)}:${fix(L)},asetpts=PTS-STARTPTS[tail]`,
    `[tail][head]acrossfade=d=${fix(d)}:c1=tri:c2=tri[xf]`,
    `[xf][mid]concat=n=2:v=0:a=1[out]`,
  ].join(';');

  execFileSync(ffmpeg, [
    '-y',
    '-i', input,
    '-filter_complex', filter,
    '-map', '[out]',
    '-ar', '44100',
    '-b:a', BITRATE,
    output,
  ], { stdio: ['ignore', 'ignore', 'inherit'] });

  return { d, loopLen: L - d };
}

function main() {
  if (!fs.existsSync(SRC_DIR)) {
    console.error(`No existe ${SRC_DIR}. Pon ahí los mp3 originales.`);
    process.exit(1);
  }
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const only = process.argv.slice(2).map((a) => a.replace(/\.mp3$/i, ''));
  let files = fs
    .readdirSync(SRC_DIR)
    .filter((f) => /\.mp3$/i.test(f));
  if (only.length) {
    files = files.filter((f) => only.includes(path.basename(f, path.extname(f))));
  }

  if (!files.length) {
    console.error('No hay mp3 para procesar.');
    process.exit(1);
  }

  for (const file of files) {
    const name = path.basename(file, path.extname(file));
    const input = path.join(SRC_DIR, file);
    const output = path.join(OUT_DIR, `${name}.mp3`);
    const L = probeDuration(input);
    const { d, loopLen } = buildLoop(input, output, L);
    console.log(
      `${name.padEnd(10)} original ${L.toFixed(1)}s  ->  loop ${loopLen.toFixed(1)}s  (crossfade ${d.toFixed(1)}s)`
    );
  }

  console.log(`\nListo. Loops en ${path.relative(process.cwd(), OUT_DIR)}`);
}

main();
