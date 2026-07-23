// resize.js
// Run with: npx -y -p sharp node resize.js
//
// Resizes each image listed in `manifest` to its target width,
// preserving aspect ratio, and writes results to ./resize/
//
// Manifest format: 'filename': [width, needsTransparency]
//   - width: target width in pixels
//   - needsTransparency: optional boolean
//       true       -> output as WebP (keeps transparency)
//       false/omit -> output as JPEG (smaller, no transparency)
// Non-PNG source files (jpg, webp, etc.) ignore the boolean and keep
// their own format, just resized.

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SOURCE_DIR = './';
const OUTPUT_DIR = './resize';
const QUALITY = 85; // JPEG/WebP quality

// --- Edit this manifest: filename -> [width, needsTransparency?] ---
const manifest = {
    'action.png': [100, true],
    'aproove.png': [100, true],
    'dancing-pigeons.png': [500],
    'describe.png': [100, true],
    'film-strip.png': [400],
    'finetune.png': [100, true],
    'frame.png': [175, true],
    'laurel.png': [100, true],
    'looking-down.png': [800],
    'looking-up.png': [800, true],
    'pint-of-bitter.png': [500],
    'polaroid1.png': [500, true],
    'polaroid2.png': [500, true],
    'polaroid3.png': [500, true],
    'polaroid4.png': [500, true],
    'polaroid5.png': [500, true],
    'polaroid6.png': [500, true],
    'polaroid7.png': [500, true],
    'polaroid8.png': [500, true],
    'rabbit-left.png': [400, true],
    'rabbit-right.png': [400, true],
    'samba-infinito.png': [500],
    'they-come-out.png': [500]
};
// ----------------------------------------------------------------

async function run() {
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    const entries = Object.entries(manifest);
    let ok = 0;
    let failed = 0;
    const renames = []; // track old->new filenames so you can update HTML/CSS references

    for (const [file, config] of entries) {
        const [width, needsTransparency] = Array.isArray(config) ? config : [config];
        const inputPath = path.join(SOURCE_DIR, file);
        const ext = path.extname(file).toLowerCase();
        const baseName = path.basename(file, ext);

        if (!fs.existsSync(inputPath)) {
            console.warn(`⚠  Skipping "${file}" — not found in ${SOURCE_DIR}`);
            failed++;
            continue;
        }

        // Decide output format
        let outputExt = ext;
        let format = null; // 'jpeg' | 'webp' | null (pass-through)

        if (ext === '.png') {
            if (needsTransparency) {
                outputExt = '.webp';
                format = 'webp';
            } else {
                outputExt = '.jpg';
                format = 'jpeg';
            }
        } else if (ext === '.jpg' || ext === '.jpeg') {
            format = 'jpeg';
        } else if (ext === '.webp') {
            format = 'webp';
        }
        // other formats (gif, svg, etc.) pass through resize only, no re-encode

        const outputFile = baseName + outputExt;
        const outputPath = path.join(OUTPUT_DIR, outputFile);

        try {
            let pipeline = sharp(inputPath).resize({ width, withoutEnlargement: true });

            if (format === 'jpeg') {
                // flatten removes alpha safely (fills with white) in case a
                // PNG marked non-transparent still has an alpha channel
                pipeline = pipeline.flatten({ background: '#ffffff' }).jpeg({ quality: QUALITY });
            } else if (format === 'webp') {
                pipeline = pipeline.webp({ quality: QUALITY });
            }

            await pipeline.toFile(outputPath);

            const { size: beforeSize } = fs.statSync(inputPath);
            const { size: afterSize } = fs.statSync(outputPath);
            const savedPct = (100 * (1 - afterSize / beforeSize)).toFixed(0);

            console.log(
                `✔ ${file} → ${outputFile}: ${width}px wide, ${(beforeSize / 1024).toFixed(0)}KB → ${(afterSize / 1024).toFixed(0)}KB (${savedPct}% smaller)`
            );

            if (outputFile !== file) {
                renames.push([file, outputFile]);
            }
            ok++;
        } catch (err) {
            console.error(`✘ Failed on "${file}": ${err.message}`);
            failed++;
        }
    }

    console.log(`\nDone. ${ok} resized, ${failed} skipped/failed.`);

    if (renames.length) {
        console.log(`\nUpdate these references in your HTML/CSS/JS:`);
        renames.forEach(([oldName, newName]) => console.log(`  ${oldName}  →  ${newName}`));
    }
}

run();