// resize.js
// Run with: npx -y -p sharp node resize.js
//
// Resizes each image listed in `manifest` to its target width,
// preserving aspect ratio, and writes results to ./resized/
// Source images are expected in ./images/

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SOURCE_DIR = './';
const OUTPUT_DIR = './';
const QUALITY = 85; // JPEG/WebP quality, ignored for PNG (uses compressionLevel below)

// --- Edit this manifest: filename -> target width in pixels ---
const manifest = {
    'action.png': 100,
    'aproove.png': 100,
    'dancing-pigeons.png': 500,
    'describe.png': 100,
    'finetune.png': 100,
    'frame.png': 175,
    'laurel.png': 100,
    'looking-down.png': 800,
    'looking-up.png': 800,
    'pint-of-bitter.png': 500,
    'polaroid1.png': 500,
    'polaroid2.png': 500,
    'polaroid3.png': 500,
    'polaroid4.png': 500,
    'polaroid5.png': 500,
    'polaroid6.png': 500,
    'polaroid7.png': 500,
    'polaroid8.png': 500,
    'rabbit-left.png': 400,
    'rabbit-right.png': 400,
    'samba-infinito.png': 500,
    'they-come-out.png': 500
};
// ----------------------------------------------------------------

async function run() {
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    const entries = Object.entries(manifest);
    let ok = 0;
    let failed = 0;

    for (const [file, width] of entries) {
        const inputPath = path.join(SOURCE_DIR, file);
        const outputPath = path.join(OUTPUT_DIR, file);
        const ext = path.extname(file).toLowerCase();

        if (!fs.existsSync(inputPath)) {
            console.warn(`⚠  Skipping "${file}" — not found in ${SOURCE_DIR}/`);
            failed++;
            continue;
        }

        try {
            let pipeline = sharp(inputPath).resize({ width, withoutEnlargement: true });

            if (ext === '.jpg' || ext === '.jpeg') {
                pipeline = pipeline.jpeg({ quality: QUALITY });
            } else if (ext === '.webp') {
                pipeline = pipeline.webp({ quality: QUALITY });
            } else if (ext === '.png') {
                pipeline = pipeline.png({ compressionLevel: 9 });
            }
            // other formats (gif, svg, etc.) pass through resize only

            await pipeline.toFile(outputPath);

            const { size: beforeSize } = fs.statSync(inputPath);
            const { size: afterSize } = fs.statSync(outputPath);
            const savedPct = (100 * (1 - afterSize / beforeSize)).toFixed(0);

            console.log(
                `✔ ${file}: ${width}px wide, ${(beforeSize / 1024).toFixed(0)}KB → ${(afterSize / 1024).toFixed(0)}KB (${savedPct}% smaller)`
            );
            ok++;
        } catch (err) {
            console.error(`✘ Failed on "${file}": ${err.message}`);
            failed++;
        }
    }

    console.log(`\nDone. ${ok} resized, ${failed} skipped/failed.`);
}

run();