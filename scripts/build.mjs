// Build script for tab-sketch.
//
// Transpiles the source tree (src/) into dist/ while PRESERVING the file
// structure, so the package keeps its multiple entry points (see "exports"
// in package.json) with good tree-shaking and no duplicated shared code.
//
// What it does:
//   1. Cleans dist/.
//   2. Finds every .js/.jsx under src/ (excluding src/stories).
//   3. Transpiles each file to dist/ as ESM, keeping react/react-dom external.
//      Imports pointing at ".jsx" files are rewritten to ".js" so the emitted
//      output references the transpiled files (which are all .js).
//   4. Copies .css files to dist/, minifying them when in prod mode.
//
// Usage:
//   node scripts/build.mjs            -> dev build (no JS minification)
//   node scripts/build.mjs --minify   -> prod build (JS + CSS minified)

import { build } from 'esbuild';
import { rm, mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const srcDir = join(root, 'src');
const distDir = join(root, 'dist');

const minify = process.argv.includes('--minify');

/** Recursively collect files under `dir`, returning absolute paths. */
async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const full = join(dir, entry.name);
      return entry.isDirectory() ? walk(full) : Promise.resolve([full]);
    })
  );
  return files.flat();
}

/** True if the path lives under src/stories (excluded from the package). */
function isStory(absPath) {
  const rel = relative(srcDir, absPath);
  return rel.split(sep)[0] === 'stories';
}

async function transpile(entryPoints) {
  await build({
    entryPoints,
    outdir: distDir,
    outbase: srcDir,
    format: 'esm',
    platform: 'browser',
    target: 'es2020',
    // With bundle:false esbuild transpiles each file independently and never
    // inlines imports, so react/react-dom (peer deps) stay as external imports
    // in the output without needing an explicit `external` list.
    bundle: false,
    minify,
    jsx: 'automatic',
    loader: { '.js': 'jsx', '.jsx': 'jsx' },
    logLevel: 'info',
  });
}

/**
 * After transpilation, rewrite any remaining ".jsx" specifiers in the emitted
 * .js files to ".js". esbuild leaves relative import paths untouched when
 * bundle is false, so we fix them here.
 */
async function fixEmittedImports() {
  const emitted = (await walk(distDir)).filter((f) => f.endsWith('.js'));
  await Promise.all(
    emitted.map(async (file) => {
      const code = await readFile(file, 'utf8');
      // Only touch relative specifiers (./ or ../) ending in .jsx
      const fixed = code.replace(
        /(from\s*['"]|import\s*['"]|import\(\s*['"])(\.\.?\/[^'"]+)\.jsx(['"])/g,
        (_m, pre, path, post) => `${pre}${path}.js${post}`
      );
      if (fixed !== code) await writeFile(file, fixed);
    })
  );
}

async function copyCss(cssFiles) {
  await Promise.all(
    cssFiles.map(async (file) => {
      const rel = relative(srcDir, file);
      const dest = join(distDir, rel);
      await mkdir(dirname(dest), { recursive: true });
      if (minify) {
        // Use esbuild's CSS minifier so we don't add another dependency.
        await build({
          entryPoints: [file],
          outfile: dest,
          minify: true,
          loader: { '.css': 'css' },
          logLevel: 'silent',
        });
      } else {
        await writeFile(dest, await readFile(file));
      }
    })
  );
}

async function main() {
  await rm(distDir, { recursive: true, force: true });
  await mkdir(distDir, { recursive: true });

  const all = (await walk(srcDir)).filter((f) => !isStory(f));
  const scriptFiles = all.filter((f) => f.endsWith('.js') || f.endsWith('.jsx'));
  const cssFiles = all.filter((f) => f.endsWith('.css'));

  await transpile(scriptFiles);
  await fixEmittedImports();
  await copyCss(cssFiles);

  console.log(
    `Build complete (${minify ? 'prod/minified' : 'dev'}): ` +
    `${scriptFiles.length} scripts, ${cssFiles.length} stylesheets -> dist/`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
