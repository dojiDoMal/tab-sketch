const cordas = { e: -5, B: -15, G: -26, D: -37, A: -48, E: -59 };
const stringPositions = [-1.5, 9.1, 19.8, 30.5, 41.2, 51.9];

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

/**
 * Transposes a chord name by a given number of semitones.
 * Handles root note and preserves the quality/suffix (m, 7, maj7, etc.)
 * @param {string} chordName - e.g. "Bm", "F#m7", "D"
 * @param {number} semitones - number of semitones to transpose (negative = down)
 * @returns {string} transposed chord name
 */
function transposeChord(chordName, semitones) {
  // Extract root (with optional # or b) and suffix
  const match = chordName.match(/^([A-G][#b]?)(.*)/);
  if (!match) return chordName;

  const [, root, suffix] = match;

  // Normalize flats to sharps for lookup
  let normalizedRoot = root;
  if (root.endsWith('b')) {
    const flatIndex = NOTES.indexOf(root[0]);
    normalizedRoot = NOTES[(flatIndex - 1 + 12) % 12];
  }

  const rootIndex = NOTES.indexOf(normalizedRoot);
  if (rootIndex === -1) return chordName;

  const newIndex = (rootIndex + semitones + 120) % 12; // +120 to handle negatives
  return NOTES[newIndex] + suffix;
}

function createFretboardHTML(capoFret, { startFret = 1 } = {}) {
  const casas = [1, 2, 3, 4].map(
    (n) => `
    <div class="casa" data-casa="${n}">
      <div class="corda"></div>
      <div class="corda"></div>
      <div class="corda"></div>
      <div class="corda"></div>
      <div class="corda-last"></div>
    </div>`
  ).join('');

  const capoHTML = capoFret ? createCapoHTML(capoFret) : '';
  const hasOffset = startFret > 1;
  const needsFadeTop = capoFret || hasOffset;
  const fadeTopHTML = needsFadeTop ? '<div class="fade-top"></div>' : '';
  const fretIndicatorHTML = hasOffset
    ? `<span class="fret-indicator">${startFret < 10 ? '\u2007' + startFret : startFret}</span>`
    : '';

  const fretboardClass = capoFret
    ? 'fretboard fretboard--capo'
    : hasOffset
      ? 'fretboard fretboard--offset'
      : 'fretboard';

  return `
    <div class="tab-sketch">
      <label class="chord-name"></label>
      <label class="tuning-info"></label>
      ${capoHTML}
      <div class="${fretboardClass}">
        ${fadeTopHTML}
        ${fretIndicatorHTML}
        ${casas}
        <div class="casa-last" data-casa="5">
          <div class="corda"></div>
          <div class="corda"></div>
          <div class="corda"></div>
          <div class="corda"></div>
          <div class="corda-last"></div>
          <div class="fade"></div>
        </div>
        <div class="strings-row"></div>
      </div>
    </div>
  `;
}

function createCapoHTML(capoFret) {
  return `
    <div class="capo${capoFret === 1 ? ' capo--first' : ''}">
      <div class="capo-fret"></div>
      <div class="capo-fret"></div>
      <div class="capo-fret"></div>
      <div class="capo-fret"></div>
      <div class="capo-fret-last"></div>
      <div class="capo-bar-wrapper">
        <div class="capo-bar">
          <span class="capo-number">${capoFret}</span>
          <span class="capo-text">CAPO</span>
        </div>
      </div>
    </div>
  `;
}

function createLabel(container, acorde, fretOffset) {
  const { type, text, casa, corda } = acorde;
  const displayCasa = casa - fretOffset;

  const x = cordas[corda];
  const y = -7;
  const barY = y + 3;

  const p = document.createElement('p');
  if (type !== 'bar') {
    p.textContent = text;
    p.className = 'label';
    p.style.top = `${y}px`;
    p.style.left = `${x}px`;
  } else {
    const barWidth = Math.abs(cordas[acorde.cordaFim] - cordas[acorde.cordaInicio]) + 8;
    const barX = cordas[acorde.cordaFim] + 1;
    p.className = 'label-bar';
    p.style.top = `${barY}px`;
    p.style.left = `${barX}px`;
    p.style.width = `${barWidth}px`;
  }

  const div = document.createElement('div');
  div.className = 'label-wrapper';
  div.appendChild(p);

  const casaEl = container.querySelector(`[data-casa="${displayCasa}"]`);
  if (!casaEl) return;
  casaEl.appendChild(div);
}

function renderStrings(container, strings) {
  const row = container.querySelector('.strings-row');
  row.innerHTML = '';
  strings.forEach((state, i) => {
    const el = document.createElement('div');
    el.style.position = 'absolute';
    el.style.top = '1.5px';
    el.style.left = `${stringPositions[i]}px`;
    if (state === 'x') {
      el.style.color = 'white';
      el.style.fontWeight = '700';
      el.style.fontSize = '8px';
      el.style.lineHeight = '8px';
      el.style.width = '4px';
      el.style.textAlign = 'center';
      el.style.top = '0px';
      el.textContent = '×';
    } else {
      el.style.borderRadius = '100px';
      el.style.width = '4px';
      el.style.height = '5px';
      el.style.backgroundColor = state === 'bass' ? 'white' : '';
      el.style.boxShadow = state === 'open' ? 'inset 0 0 0 1px white' : '';
    }
    row.appendChild(el);
  });
}

/**
 * Renders a chord diagram into the given container element.
 * @param {HTMLElement} container - The DOM element to render into
 * @param {object} chordData - Chord data object with { metadata, shape }
 * @param {object} [options] - Rendering options
 * @param {number} [options.capo] - Capo fret position (e.g. 2 means capo on 2nd fret)
 * @param {number} [options.tuning] - Tuning offset in semitones relative to standard tuning.
 *   Negative values mean tuning down (e.g. -2 = 1 tom abaixo).
 *   When set, displays the real sounding chord below the diagram.
 *   Example: tuning=-2 with shape "Bm" shows "Am com forma de Bm".
 * @param {string} [options.titleColor] - Custom color for the chord name title (e.g. '#ff0', 'red').
 */
export function renderChord(container, chordData, options = {}) {
  const capo = options.capo && options.capo > 0 ? options.capo : undefined;
  const tuning = typeof options.tuning === 'number' && options.tuning !== 0
    ? options.tuning
    : undefined;

  // Calculate fret offset: if the lowest fret is > 4, shift so it starts at 1
  const frets = chordData.shape.map((s) => s.casa);
  const minFret = Math.min(...frets);
  const maxFret = Math.max(...frets);
  const fretOffset = maxFret > 5 ? minFret - 1 : 0;
  const startFret = fretOffset > 0 ? fretOffset + 1 + (capo || 0) : 0;

  container.classList.add('tab-sketch-wrapper');

  const inner = document.createElement('div');
  inner.innerHTML = createFretboardHTML(capo, { startFret });
  inner.classList.add('tab-sketch-container');
  container.innerHTML = '';
  container.appendChild(inner);

  const shapeName = chordData.metadata.name;
  const totalOffset = (capo || 0) + (tuning || 0);
  const realChord = transposeChord(shapeName, totalOffset);

  const root = inner.querySelector('.tab-sketch');
  const chordTitle = root.querySelector('.chord-name');
  chordTitle.textContent = (totalOffset !== 0) ? `${realChord}*` : chordData.metadata.name;
  if (options.titleColor) {
    chordTitle.style.color = options.titleColor;
  }

  // Tuning info: capo adds semitones (+), tuning offsets (can be negative)
  const tuningLabel = root.querySelector('.tuning-info');
  if (totalOffset !== 0) {
    const tuningText = `${realChord} com forma de ${shapeName}`;
    //tuningLabel.innerHTML = `<b>${realChord}</b> com forma de <b>${shapeName}</b>`;
    tuningLabel.innerHTML = `forma de <b>${shapeName}</b>`;
    tuningLabel.style.marginBottom = '8px'
    inner.setAttribute('title', tuningText);
  } else {
    tuningLabel.textContent = '';
    inner.removeAttribute('title');
  }

  renderStrings(root, chordData.metadata.strings);
  chordData.shape.forEach((item) => createLabel(root, item, fretOffset));
}

/**
 * Creates the fretboard HTML string (useful for SSR or static rendering).
 * @returns {string} The HTML string for an empty fretboard
 */
export { createFretboardHTML, transposeChord };
