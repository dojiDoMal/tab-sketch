const cordas = { e: -5, B: -15, G: -26, D: -37, A: -48, E: -59 };
const stringPositions = [-1.5, 9.1, 19.8, 30.5, 41.2, 51.9];

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
    ? `<span class="fret-indicator">${startFret}</span>`
    : '';

  const fretboardClass = capoFret
    ? 'fretboard fretboard--capo'
    : hasOffset
      ? 'fretboard fretboard--offset'
      : 'fretboard';

  return `
    <div class="tab-sketch">
      <label class="chord-name"></label>
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
 */
export function renderChord(container, chordData, options = {}) {
  const capo = options.capo && options.capo > 0 ? options.capo : undefined;

  // Calculate fret offset: if the lowest fret is > 4, shift so it starts at 1
  const frets = chordData.shape.map((s) => s.casa);
  const minFret = Math.min(...frets);
  const maxFret = Math.max(...frets);
  const fretOffset = maxFret > 5 ? minFret - 1 : 0;
  const startFret = fretOffset > 0 ? fretOffset + 1 + (capo || 0) : 0;

  container.innerHTML = createFretboardHTML(capo, { startFret });
  container.classList.add('tab-sketch-container');

  const root = container.querySelector('.tab-sketch');
  const chordTitle = root.querySelector('.chord-name');
  chordTitle.textContent = capo ? `${chordData.metadata.name}*` : chordData.metadata.name;

  renderStrings(root, chordData.metadata.strings);
  chordData.shape.forEach((item) => createLabel(root, item, fretOffset));
}

/**
 * Creates the fretboard HTML string (useful for SSR or static rendering).
 * @returns {string} The HTML string for an empty fretboard
 */
export { createFretboardHTML };
