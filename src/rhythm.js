/**
 * Rhythm pattern renderer for tab-sketch.
 *
 * Stroke types:
 *   'D' = down stroke (seta para baixo)
 *   'U' = up stroke (seta para cima)
 *   'X' = muted/abafado
 *   '_' = empty/rest (sem ação)
 *
 * @example
 * renderRhythm(container, {
 *   bpm: 72,
 *   timeSignature: [4, 4],
 *   pattern: [
 *     'D', '_', '_', 'U',
 *     'X', 'U', 'D', '_',
 *     '_', 'U', 'D', 'U',
 *     'X', 'U', 'D', 'U',
 *   ]
 * });
 */

const ARROW = '\u279D'; // ➝

/**
 * Creates the HTML for a single stroke cell.
 */
function createStrokeHTML(stroke) {
  switch (stroke) {
    case 'D':
      return `<span class="rhythm-stroke rhythm-stroke--down">${ARROW}</span>`;
    case 'U':
      return `<span class="rhythm-stroke rhythm-stroke--up">${ARROW}</span>`;
    case 'X':
      return `<span class="rhythm-stroke rhythm-stroke--mute"><span>\u2A2F</span><span>\u2A2F</span></span>`;
    case '_':
    default:
      return `<span class="rhythm-stroke rhythm-stroke--empty"></span>`;
  }
}

/**
 * Creates the beat counter row HTML.
 * For a 4/4 time signature with 4 subdivisions per beat:
 * "1 - - - 2 - - - 3 - - - 4 - - -"
 */
function createBeatCounterHTML(beats, subdivisionsPerBeat) {
  let html = '';
  for (let beat = 1; beat <= beats; beat++) {
    html += `<span class="rhythm-beat-number">${beat}</span>`;
    for (let sub = 1; sub < subdivisionsPerBeat; sub++) {
      html += `<span class="rhythm-beat-subdivider">-</span>`;
    }
  }
  return html;
}

/**
 * Renders a rhythm pattern into the given container element.
 *
 * @param {HTMLElement} container - The DOM element to render into
 * @param {object} rhythmData - Rhythm configuration
 * @param {number} rhythmData.bpm - Beats per minute
 * @param {[number, number]} rhythmData.timeSignature - Time signature as [beats, noteValue], e.g. [4, 4]
 * @param {string[]} rhythmData.pattern - Array of stroke types: 'D' | 'U' | 'X' | '_'
 * @param {boolean} [rhythmData.showBpmLabel=true] - Whether to display the BPM label
 * @param {boolean} [rhythmData.dense=false] - When true, uses fit-content width instead of full width
 */
export function renderRhythm(container, rhythmData) {
  const { bpm, timeSignature, pattern, showBpmLabel = true, dense = false } = rhythmData;
  const [beats, noteValue] = timeSignature;
  const subdivisionsPerBeat = pattern.length / beats;

  const bpmHTML = showBpmLabel ? `<div class="rhythm-bpm"><span>${bpm} bpm</span></div>` : '';

  const strokesHTML = pattern.map((stroke) => createStrokeHTML(stroke)).join('');
  const patternRowHTML = `<div class="rhythm-pattern">${strokesHTML}</div>`;

  const counterHTML = createBeatCounterHTML(beats, subdivisionsPerBeat);
  const counterRowHTML = `<div class="rhythm-counter">${counterHTML}</div>`;

  const denseClass = dense ? ' rhythm-sketch--dense' : '';

  container.innerHTML = `
    <div class="rhythm-sketch${denseClass}">
      ${bpmHTML}
      ${patternRowHTML}
      ${counterRowHTML}
    </div>
  `;

  container.classList.add('rhythm-sketch-container');
}

/**
 * Creates the rhythm HTML as a string (useful for SSR or static rendering).
 *
 * @param {object} rhythmData - Same as renderRhythm
 * @returns {string} HTML string
 */
export function createRhythmHTML(rhythmData) {
  const { bpm, timeSignature, pattern, showBpmLabel = true, dense = false } = rhythmData;
  const [beats] = timeSignature;
  const subdivisionsPerBeat = pattern.length / beats;

  const bpmHTML = showBpmLabel ? `<div class="rhythm-bpm"><span>${bpm} bpm</span></div>` : '';

  const strokesHTML = pattern.map((stroke) => createStrokeHTML(stroke)).join('');
  const patternRowHTML = `<div class="rhythm-pattern">${strokesHTML}</div>`;

  const counterHTML = createBeatCounterHTML(beats, subdivisionsPerBeat);
  const counterRowHTML = `<div class="rhythm-counter">${counterHTML}</div>`;

  const denseClass = dense ? ' rhythm-sketch--dense' : '';

  return `
    <div class="rhythm-sketch${denseClass}">
      ${bpmHTML}
      ${patternRowHTML}
      ${counterRowHTML}
    </div>
  `;
}
