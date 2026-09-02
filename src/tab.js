/**
 * Guitar tablature renderer for tab-sketch.
 *
 * Parses standard 6-line ASCII tablature (the format widely used on cifra/tab
 * sites) into a column-based model, then re-renders it as monospaced HTML with
 * intelligent line wrapping that respects the available container width.
 *
 * Input format (one block, 4 to 8 string lines, top string first):
 *
 *   e|-----0-----|
 *   B|---1---1---|
 *   G|-0-------0-|
 *   D|-----------|
 *   A|-----------|
 *   E|-----------|
 *
 * The leading string label ("e|", "B|", ...) is optional. Bar lines "|" inside
 * the tab are preserved.
 *
 * Alignment model — ONE CHARACTER = ONE COLUMN
 * --------------------------------------------
 * ASCII tab is already perfectly aligned by the monospaced font: each character
 * position lines up vertically across all six strings. So the parser keeps every
 * character as its own column and never groups characters into tokens or pads
 * them. This is what guarantees fidelity: whatever the user types (`0p`, `12`,
 * `7b9r7`, `~`, `/`) is preserved character-for-character, and the six rows stay
 * aligned because they all have the same number of columns.
 *
 * The only special handling is for wrapping (see wrapColumns): we avoid breaking
 * a line in the middle of a two-digit fret, and prefer to break at bar lines.
 *
 * Data model produced by parseTab():
 *   {
 *     strings: string[],                 // string labels, e.g. ['e','B','G','D','A','E']
 *     columns: Array<{
 *       cells: string[],                 // one CHARACTER per string (same order as `strings`)
 *       isBar: boolean,                  // true when this column is a bar line "|"
 *     }>,
 *   }
 *
 * @example
 * renderTab(container, `
 *   e|-----0-----|
 *   B|---1---1---|
 *   G|-0-------0-|
 *   D|-----------|
 *   A|-----------|
 *   E|-----------|
 * `);
 */

const DEFAULT_STRINGS = ['e', 'B', 'G', 'D', 'A', 'E'];

/**
 * Splits a single tab line into its label and body.
 * Accepts an optional leading "X|" label. Returns { label, body }.
 */
function splitLabel(line) {
  const m = line.match(/^\s*([a-gA-G#b]{1,3})\s*\|(.*)$/);
  if (m) {
    return { label: m[1], body: m[2] };
  }
  return { label: null, body: line.replace(/^\s+/, '') };
}

/**
 * Parses ASCII tablature text into the column-based data model.
 *
 * Lines that don't look like tab (blank, or without dashes/bars) are ignored so
 * users can paste blocks that include stray whitespace. Multiple stacked blocks
 * are concatenated left-to-right into a single continuous model, which the
 * renderer then re-wraps to fit the container.
 *
 * Every character of each body becomes one column. Rows shorter than the widest
 * row in a block are right-padded with '-' so all strings keep the same length.
 *
 * @param {string} text
 * @returns {{ strings: string[], columns: Array<{ cells: string[], isBar: boolean }> }}
 */
export function parseTab(text) {
  const rawLines = String(text || '').replace(/\r\n/g, '\n').split('\n');

  // Group consecutive tab-looking lines into blocks.
  const blocks = [];
  let current = [];
  const looksLikeTab = (line) => /[-|]/.test(line) && /[-|\d]/.test(line);

  for (const line of rawLines) {
    if (line.trim() === '') {
      if (current.length) {
        blocks.push(current);
        current = [];
      }
      continue;
    }
    if (looksLikeTab(line)) {
      current.push(line);
    } else if (current.length) {
      // A non-tab line ends the current block.
      blocks.push(current);
      current = [];
    }
  }
  if (current.length) blocks.push(current);

  if (blocks.length === 0) {
    return { strings: [...DEFAULT_STRINGS], columns: [] };
  }

  // Determine the string labels from the first block.
  const firstBlock = blocks[0];
  const parsedFirst = firstBlock.map(splitLabel);
  const stringCount = parsedFirst.length;
  const strings = parsedFirst.every((p) => p.label)
    ? parsedFirst.map((p) => p.label)
    : DEFAULT_STRINGS.slice(0, stringCount);

  const columns = [];

  for (const block of blocks) {
    // Each row is the raw body as an array of characters.
    const rows = block.slice(0, stringCount).map((line) => [...splitLabel(line).body]);
    while (rows.length < stringCount) rows.push([]);

    const width = Math.max(...rows.map((r) => r.length), 0);

    for (let col = 0; col < width; col++) {
      // One character per string. Missing positions become filler dashes.
      const cells = rows.map((row) => {
        const c = row[col];
        return c === undefined || c === ' ' ? '-' : c;
      });
      const bars = cells.filter((c) => c === '|').length;
      const isBar = bars >= Math.ceil(stringCount / 2);
      columns.push({ cells, isBar });
    }
  }

  return { strings, columns };
}

/**
 * Escapes HTML-special characters (tab data is user text).
 */
function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Renders a single character cell. Filler dashes render as the string line;
 * digits render as notes; everything else (technique markers, "x", bar lines)
 * renders verbatim. Because every cell is exactly one character wide, the
 * monospaced grid keeps all six strings aligned automatically.
 *
 * @param {string} ch - the single character for this string at this column
 * @param {number} stringIndex
 */
function createCellHTML(ch, stringIndex) {
  if (ch === '|') {
    return `<span class="tab-cell tab-cell--bar">|</span>`;
  }

  if (ch === '-' || ch === '' || ch === undefined) {
    return `<span class="tab-cell tab-cell--filler">-</span>`;
  }

  const cls = /\d/.test(ch) ? 'tab-cell tab-cell--note' : 'tab-cell tab-cell--tech';
  return `<span class="${cls}" data-string="${stringIndex}">${esc(ch)}</span>`;
}

/**
 * Builds the HTML for one wrapped chunk of columns (a full staff).
 *
 * @param {string[]} strings
 * @param {Array<{cells:string[], isBar:boolean}>} columns
 * @returns {string}
 */
function createStaffHTML(strings, columns) {
  const rowsHTML = strings.map((label, stringIndex) => {
    const cellsHTML = columns
      .map((col) => createCellHTML(col.cells[stringIndex], stringIndex))
      .join('');
    return `<div class="tab-row"><span class="tab-string-label">${esc(label)}</span><span class="tab-string-open">|</span><span class="tab-line">${cellsHTML}</span></div>`;
  });
  return `<div class="tab-staff">${rowsHTML.join('')}</div>`;
}

/**
 * True when breaking BETWEEN column i-1 and column i would split a multi-digit
 * fret. We consider it unsafe to break if the previous column and the current
 * column both hold a digit on the same string (e.g. the "1" and "2" of "12").
 */
function isUnsafeBreak(columns, i) {
  if (i <= 0 || i >= columns.length) return false;
  const prev = columns[i - 1].cells;
  const curr = columns[i].cells;
  for (let s = 0; s < curr.length; s++) {
    if (/\d/.test(prev[s] || '') && /\d/.test(curr[s] || '')) return true;
  }
  return false;
}

/**
 * Wraps columns into chunks that fit `colsPerLine` columns each.
 *
 * Preference order for the break point, searching backwards from the hard limit:
 *   1. Right after a bar line (keeps measures intact).
 *   2. Any position that isn't in the middle of a two-digit fret.
 * If neither is found we break at the hard limit anyway.
 *
 * @param {Array<{cells:string[], isBar:boolean}>} columns
 * @param {number} colsPerLine
 * @returns {Array<Array<object>>}
 */
function wrapColumns(columns, colsPerLine) {
  if (colsPerLine <= 0 || columns.length === 0) return [columns];

  const chunks = [];
  let start = 0;

  while (start < columns.length) {
    let end = Math.min(start + colsPerLine, columns.length);

    if (end < columns.length) {
      // 1. Prefer breaking right after the last bar line in range.
      let barBreak = -1;
      for (let i = end - 1; i > start; i--) {
        if (columns[i].isBar) {
          barBreak = i + 1;
          break;
        }
      }

      if (barBreak > start && barBreak <= end) {
        end = barBreak;
      } else if (isUnsafeBreak(columns, end)) {
        // 2. Back up until the break no longer splits a multi-digit fret.
        let safe = end;
        while (safe > start + 1 && isUnsafeBreak(columns, safe)) safe--;
        if (safe > start) end = safe;
      }
    }

    chunks.push(columns.slice(start, end));
    start = end;
  }

  return chunks;
}

/**
 * Creates the tablature HTML as a string.
 *
 * @param {string|object} tabData - Raw tab text, or a parsed model from parseTab()
 * @param {object} [options]
 * @param {number} [options.colsPerLine=0] - Max columns per staff line (0 = no wrapping)
 * @returns {string} HTML string
 */
export function createTabHTML(tabData, options = {}) {
  const model = typeof tabData === 'string' ? parseTab(tabData) : tabData;
  const { strings, columns } = model;
  const { colsPerLine = 0 } = options;

  if (!columns || columns.length === 0) {
    return `<div class="tab-sketch-tab"></div>`;
  }

  const chunks = colsPerLine > 0 ? wrapColumns(columns, colsPerLine) : [columns];
  const staves = chunks.map((chunk) => createStaffHTML(strings, chunk));

  return `<div class="tab-sketch-tab">${staves.join('')}</div>`;
}

/**
 * Renders tablature into the given container element.
 *
 * @param {HTMLElement} container
 * @param {string|object} tabData - Raw tab text, or a parsed model from parseTab()
 * @param {object} [options] - Same as createTabHTML
 */
export function renderTab(container, tabData, options = {}) {
  container.innerHTML = createTabHTML(tabData, options);
  container.classList.add('tab-sketch-tab-container');
}
