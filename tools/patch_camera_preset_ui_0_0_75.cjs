#!/usr/bin/env node
'use strict';
/**
 * CAM preset input UI-only patch for command_block_coding 0.0.75.
 * Never rewrites AST, compiler, validator, registry, or unrelated TypeScript.
 * Does not need network access. Refuses unrecognized/partially changed sources.
 */
const fs = require('node:fs');
const path = require('node:path');
const argv = process.argv.slice(2);
let apply = false;
let root = path.resolve(__dirname, '..');
for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--apply') apply = true;
    else if (argv[i] === '--check') { /* default is dry run */ }
    else if (argv[i] === '--root' && argv[i + 1]) root = path.resolve(argv[++i]);
    else {
        console.error('Usage: node tools/patch_camera_preset_ui_0_0_75.cjs [--check|--apply] [--root path]');
        process.exit(2);
    }
}
function die(message) { throw new Error(message); }
function count(src, text) { return src.split(text).length - 1; }
const file = path.join(root, 'src', 'blocks', 'camera_blocks.ts');
const libraryFile = path.join(root, 'src', 'libraries', 'camera_preset_library.generated.ts');
const configFile = path.join(root, 'pxt.json');
try {
    const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
    if (config.version !== '0.0.75') die(`Expected version 0.0.75; got ${config.version}. No change made.`);
    if (!config.files.includes('src/libraries/camera_preset_library.generated.ts') ||
        !config.files.includes('src/blocks/camera_blocks.ts')) die('pxt.json does not include required library and command block files.');
    const library = fs.readFileSync(libraryFile, 'utf8');
    if (!library.includes('blockId=mcfunction_camera_library_first_person') ||
        !library.includes('export function firstPerson(): Command.CameraPresetValue')) {
        die('CAMERA PRESET firstPerson reporter is absent or incompatible.');
    }
    const original = fs.readFileSync(file, 'utf8');
    const legacy = 'preset.shadow="mcfunction_camera_preset_builtin"';
    const modern = 'preset.shadow="mcfunction_camera_library_first_person"';
    const oldCount = count(original, legacy);
    const newCount = count(original, modern);
    const legacyBlockID = '//% blockId=mcfunction_camera_preset_builtin';
    if (count(original, legacyBlockID) !== 1) die('Legacy camera preset block ID not found exactly once.');
    if (!original.includes('export function cameraPresetBuiltin(preset: CameraPresetChoice): CameraPresetValue')) {
        die('Legacy camera preset function missing.');
    }
    if (!(oldCount === 13 && newCount === 0) && !(oldCount === 0 && newCount === 13)) {
        die(`Unexpected preset shadow layout (old=${oldCount}, new=${newCount}; expected 13 unchanged slots). No change made.`);
    }
    const linesep = original.includes('\r\n') ? '\r\n' : '\n';
    const keepLegacy = legacyBlockID + linesep + '    //% blockHidden=true';
    let updated = original;
    if (oldCount === 13) updated = updated.split(legacy).join(modern);
    if (!updated.includes(keepLegacy)) {
        const before = '    ' + legacyBlockID + linesep;
        if (!updated.includes(before)) die('Unexpected location for legacy block ID, refusing to hide it.');
        updated = updated.replace(before, '    ' + legacyBlockID + linesep + '    //% blockHidden=true' + linesep);
    }
    if (count(updated, modern) !== 13 || count(updated, legacy) !== 0) die('Internal verification failed.');
    if (!updated.includes('export function cameraPresetBuiltin(preset: CameraPresetChoice): CameraPresetValue')) {
        die('Internal verification: legacy API would be removed.');
    }
    if (updated === original) {
        console.log('ALREADY APPLIED: all 13 CAMERA SET preset sockets use CAMERA PRESET library.');
        console.log('No files changed.');
    } else if (!apply) {
        console.log('DRY RUN: ready to update 13 CAMERA preset shadows and hide (not delete) the legacy 4-choice reporter.');
        console.log('No files changed. Rerun with --apply to modify camera_blocks.ts.');
    } else {
        const backup = file + '.before_camera_preset_ui_0_0_75.bak';
        if (fs.existsSync(backup)) die(`Backup already exists: ${backup}. No change made.`);
        fs.copyFileSync(file, backup, fs.constants.COPYFILE_EXCL);
        fs.writeFileSync(file, updated, 'utf8');
        if (fs.readFileSync(file, 'utf8') !== updated) die(`Could not verify saved file; restore backup ${backup}`);
        console.log('UPDATED src/blocks/camera_blocks.ts: 13 preset shadows now use CAMERA PRESET library.');
        console.log('Legacy 4-choice reporter retained, hidden in new Toolbox only.');
        console.log('BACKUP src/blocks/camera_blocks.ts.before_camera_preset_ui_0_0_75.bak');
        console.log('No other files changed.');
    }
} catch (e) {
    console.error('SAFE STOP: ' + e.message);
    process.exit(1);
}
