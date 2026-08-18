/**
 * Lyrics + chords renderer for tab-sketch.
 *
 * Data structure:
 *   {
 *     lines: [
 *       {
 *         segments: [
 *           { chord: 'G', text: 'Mesmo', align: 'flex-end' },
 *           { text: 'que você' },
 *         ]
 *       }
 *     ]
 *   }
 *
 * Each segment represents a piece of text in a line.
 * - chord (optional): chord name displayed above the text
 * - text: the lyrics text for this segment
 * - align (optional): controls align-items on the segment column
 *     'flex-start' | 'center' | 'flex-end' (default: 'flex-start')
 *
 * @example
 * renderLyrics(container, {
 *   lines: [
 *     { segments: [
 *       { chord: 'G', text: 'Mesmo', align: 'flex-end' },
 *       { text: 'que você' },
 *     ]},
 *     { segments: [
 *       { text: 'Não caia na minha cantada' },
 *     ]},
 *   ]
 * }, { chordColor: '#ff0' });
 */

/**
 * Creates the HTML string for a single segment (chord + text column).
 * @param {object} segment
 * @param {object} options
 * @returns {string}
 */
function createSegmentHTML(segment, options = {}) {
  const align = segment.align || 'flex-start';
  const chordColor = options.chordColor || 'white';

  let chordHTML;
  if (segment.chord) {
    const chordList = Array.isArray(segment.chord) ? segment.chord : [segment.chord];
    const chordsStr = chordList
      .map((c) => `<span class="lyrics-chord" style="color: ${chordColor}">${c}</span>`)
      .join('');
    chordHTML = `<span class="lyrics-chord-group" style="align-self: ${align}">${chordsStr}</span>`;
  } else {
    chordHTML = `<span class="lyrics-chord lyrics-chord--empty"></span>`;
  }

  const textHTML = `<span class="lyrics-text">${segment.text}</span>`;

  return `
    <span class="lyrics-segment">
      ${chordHTML}
      ${textHTML}
    </span>
  `;
}

/**
 * Creates the HTML string for a full line of segments.
 * @param {object} line
 * @param {object} options
 * @returns {string}
 */
function createLineHTML(line, options = {}) {
  const segmentsHTML = line.segments
    .map((segment) => createSegmentHTML(segment, options))
    .join('');

  return `<div class="lyrics-line">${segmentsHTML}</div>`;
}

/**
 * Creates the full lyrics HTML as a string (useful for SSR or static rendering).
 * @param {object} lyricsData - Lyrics data with { lines: [...] }
 * @param {object} [options] - Rendering options
 * @param {string} [options.chordColor] - Custom color for chord names (e.g. '#ff0', 'red')
 * @returns {string} HTML string
 */
export function createLyricsHTML(lyricsData, options = {}) {
  const linesHTML = lyricsData.lines
    .map((line) => createLineHTML(line, options))
    .join('');

  return `<div class="lyrics-sketch">${linesHTML}</div>`;
}

/**
 * Renders lyrics with chords into the given container element.
 * @param {HTMLElement} container - The DOM element to render into
 * @param {object} lyricsData - Lyrics data with { lines: [...] }
 * @param {object} [options] - Rendering options
 * @param {string} [options.chordColor] - Custom color for chord names (e.g. '#ff0', 'red')
 */
export function renderLyrics(container, lyricsData, options = {}) {
  container.innerHTML = createLyricsHTML(lyricsData, options);
  container.classList.add('lyrics-sketch-container');
}
