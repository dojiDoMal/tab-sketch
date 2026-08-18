
// Shape templates for minor chords (offsets relative to the bar/root fret)
const minorShapes = {
  // Am shape: bar parcial (A→e), dedos em D, G, B
  Am: {
    strings: ['x', 'bass', 'open', 'open', 'open', 'open'],
    shape: [
      { type: 'bar', cordaInicio: 'e', cordaFim: 'A', offset: 0 },
      { text: '3', corda: 'D', offset: 2 },
      { text: '4', corda: 'G', offset: 2 },
      { text: '2', corda: 'B', offset: 1 },
    ],
  },
  // Em shape: bar completo (E→e), dedos em A, D
  Em: {
    strings: ['bass', 'open', 'open', 'open', 'open', 'open'],
    shape: [
      { type: 'bar', cordaInicio: 'e', cordaFim: 'E', offset: 0 },
      { text: '3', corda: 'A', offset: 2 },
      { text: '4', corda: 'D', offset: 2 },
    ],
  },
  // Dm shape: sem pestana, 4 dedos individuais
  Dm: {
    strings: ['x', 'x', 'bass', 'open', 'open', 'open'],
    shape: [
      { text: '1', corda: 'D', offset: 0 },
      { text: '3', corda: 'G', offset: 2 },
      { text: '4', corda: 'B', offset: 3 },
      { text: '2', corda: 'e', offset: 1 },
    ],
  },
};

const minorSeventhShapes = {
  Am7: {
    strings: ['x', 'bass', 'open', 'open', 'open', 'open'],
    shape: [
      { type: 'bar', cordaInicio: 'e', cordaFim: 'A', offset: 0 },
      { text: '3', corda: 'D', offset: 2 },
      { text: '2', corda: 'B', offset: 1 },
    ],
  },
  Em7: {
    strings: ['bass', 'open', 'open', 'open', 'open', 'open'],
    shape: [
      { type: 'bar', cordaInicio: 'e', cordaFim: 'E', offset: 0 },
      { text: '3', corda: 'A', offset: 2 },
    ],
  },
  'D#m7': {
    strings: ['x', 'x', 'bass', 'open', 'open', 'open'],
    shape: [
      { text: '1', corda: 'D', offset: 1 },
      { text: '4', corda: 'G', offset: 3 },
      { text: '2', corda: 'B', offset: 2 },
      { text: '3', corda: 'e', offset: 2 },
    ],
  },
  Cm7: { // Todo: na verdade esse shape é Xm7(9)
    strings: ['x', 'bass', 'open', 'open', 'open', 'x'],
    shape: [
      { text: '2', corda: 'A', offset: 3 },
      { text: '1', corda: 'D', offset: 1 },
      { text: '3', corda: 'G', offset: 3 },
      { text: '4', corda: 'B', offset: 3 },
    ],
  },
  Gm7: {
    strings: ['bass', 'open', 'open', 'open', 'x', 'x'],
    shape: [
      { text: '2', corda: 'E', offset: 3 },
      { text: '1', corda: 'A', offset: 1 },
      { text: '3', corda: 'D', offset: 3 },
      { text: '4', corda: 'G', offset: 3 },
    ],
  }
};

// Shape templates for 9th chords
const ninthShapes = {
  D9: {
    strings: ['x', 'x', 'bass', 'open', 'open', 'open'],
    shape: [
      { type: 'bar', cordaInicio: 'e', cordaFim: 'D', offset: 0 },
      { text: '2', corda: 'G', offset: 2 },
      { text: '3', corda: 'B', offset: 3 },
    ],
  },
  E9: {
    strings: ['bass', 'open', 'open', 'open', 'open', 'open'],
    shape: [
      { type: 'bar', cordaInicio: 'e', cordaFim: 'E', offset: 0 },
      { text: '2', corda: 'G', offset: 1 },
      { text: '3', corda: 'A', offset: 2 },
      { text: '4', corda: 'D', offset: 4 },
    ],
  },
  A9: {
    strings: ['x', 'bass', 'open', 'open', 'open', 'open'],
    shape: [
      { type: 'bar', cordaInicio: 'e', cordaFim: 'A', offset: 0 },
      { text: '2', corda: 'D', offset: 2 },
      { text: '3', corda: 'G', offset: 2 },
    ],
  },
};

// Shape templates for maj7/bass chords (root on A string)
const maj7BassShapes = {
  // X7M shape variant 0: A(0), D(0), G(-1), B(-2)
  X7M_A0: {
    strings: ['x', 'bass', 'open', 'open', 'open', 'open'],
    shape: [
      { text: '3', corda: 'A', offset: 3 },
      { text: '4', corda: 'D', offset: 3 },
      { text: '2', corda: 'G', offset: 2 },
      { text: '1', corda: 'B', offset: 1 },
    ],
  },
  // X7M shape variant 1: G(0), A(+1), D(+1), B(+3) — rootFret = casa do G
  X7M_A1: {
    strings: ['x', 'bass', 'open', 'open', 'open', 'x'],
    shape: [
      { text: '1', corda: 'G', offset: 0 },
      { text: '2', corda: 'A', offset: 1 },
      { text: '3', corda: 'D', offset: 1 },
      { text: '4', corda: 'B', offset: 3 },
    ],
  },
};

const MAJ7_ROOT_OFFSETS = { X7M_A0: 0, X7M_A1: -1 };

function buildMaj7SlashChord(name, rootFret) {
  return ['X7M_A0', 'X7M_A1'].map((templateKey, i) => {
    const template = maj7BassShapes[templateKey];
    const base = rootFret + MAJ7_ROOT_OFFSETS[templateKey];
    return {
      metadata: { name, variant: i, strings: template.strings },
      shape: template.shape.map(({ offset, ...rest }) => ({ ...rest, casa: base + offset })),
    };
  });
}

// Special shapes: absolute fret positions, outside CAGED system
const specialShapes = {
  A: {
    strings: ['x', 'bass', 'open', 'open', 'open', 'open'],
    shape: [
      { type: 'bar', cordaInicio: 'B', cordaFim: 'D', offset: 2 },
    ],
  },
  G: {
    strings: ['bass', 'open', 'open', 'open', 'open', 'open'],
    shape: [
      { text: '2', corda: 'E', offset: 3 },
      { text: '1', corda: 'A', offset: 2 },
      { text: '3', corda: 'B', offset: 3 },
      { text: '4', corda: 'e', offset: 3 },
    ],
  },
  C9: {
    strings: ['x', 'bass', 'open', 'open', 'open', 'open'],
    shape: [
      { text: '2', corda: 'A', offset: 3 },
      { text: '1', corda: 'D', offset: 2 },
      { text: '3', corda: 'B', offset: 3 },
      { text: '4', corda: 'e', offset: 3 },
    ],
  },
};

function buildSpecialChord(name, template, variantIndex) {
  return {
    metadata: { name, variant: variantIndex, strings: template.strings },
    shape: template.shape.map(({ offset, ...rest }) => ({ ...rest, casa: offset })),
  };
}

// Shape templates for major chords
const majorShapes = {
  // E shape: bar completo (E→e), dedos em G(+1), A(+2), D(+2)
  E: {
    strings: ['bass', 'open', 'open', 'open', 'open', 'open'],
    shape: [
      { type: 'bar', cordaInicio: 'e', cordaFim: 'E', offset: 0 },
      { text: '2', corda: 'G', offset: 1 },
      { text: '3', corda: 'A', offset: 2 },
      { text: '4', corda: 'D', offset: 2 },
    ],
  },
  A: {
    strings: ['x', 'bass', 'open', 'open', 'open', 'open'],
    shape: [
      { type: 'bar', cordaInicio: 'e', cordaFim: 'A', offset: 0 },
      { text: '2', corda: 'D', offset: 2 },
      { text: '3', corda: 'G', offset: 2 },
      { text: '4', corda: 'B', offset: 2 },
    ],
  },
  D: {
    strings: ['x', 'x', 'bass', 'open', 'open', 'open'],
    shape: [
      { type: 'bar', cordaInicio: 'e', cordaFim: 'D', offset: 0 },
      { text: '2', corda: 'G', offset: 2 },
      { text: '4', corda: 'B', offset: 3 },
      { text: '3', corda: 'e', offset: 2 },
    ],
  },
  C: {
    strings: ['x', 'bass', 'open', 'open', 'open', 'open'],
    shape: [
      { type: 'bar', cordaInicio: 'e', cordaFim: 'G', offset: 0 },
      { text: '2', corda: 'B', offset: 1 },
      { text: '3', corda: 'D', offset: 2 },
      { text: '4', corda: 'A', offset: 3 },
    ],
  },
  G: {
    strings: ['bass', 'open', 'open', 'open', 'open', 'open'],
    shape: [
      { type: 'bar', cordaInicio: 'e', cordaFim: 'D', offset: 0 },
      { text: '3', corda: 'E', offset: 3 },
      { text: '2', corda: 'A', offset: 2 },
      { text: '4', corda: 'e', offset: 3 },
    ],
  },
};

/**
 * Builds chord variants from shape templates + fret offset.
 * When fret === 0, the bar is omitted and finger numbers are decremented by 1.
 */
function buildChord(name, variants) {
  return variants.map((v, i) => {
    const template = minorShapes[v.template] || minorSeventhShapes[v.template] || majorShapes[v.template] || ninthShapes[v.template];
    const isOpen = v.fret === 0;
    const hasBar = template.shape.some(s => s.type === 'bar');
    return {
      metadata: { name, variant: i, strings: template.strings },
      shape: template.shape
        .filter(s => !(isOpen && s.type === 'bar'))
        .map(({ offset, ...rest }) => ({
          ...rest,
          ...(isOpen && hasBar && rest.text ? { text: String(Number(rest.text) - 1) } : {}),
          casa: v.fret + offset,
        })),
    };
  });
}

// rootFret = fret do template E para aquele acorde
const MAJOR_OFFSETS = [
  { template: 'E', offset: 0 },
  { template: 'D', offset: 2 },
  { template: 'G', offset: 9 },
  { template: 'A', offset: 7 },
  { template: 'C', offset: 4 },
];

function buildMajorChord(name, rootFret) {
  return buildChord(name, MAJOR_OFFSETS.map(({ template, offset }) => ({
    template,
    fret: ((rootFret + offset - 1 + 12) % 12) + 1,
  })));
}

// rootFret = semitom da raiz relativo a Am (Am=0, A#=1, B=2, ...)
const M7_OFFSETS = [
  { template: 'Am7', offset: 0 },
  { template: 'Em7', offset: 5 },
  { template: 'D#m7', offset: 6 },
  { template: 'Cm7', offset: 9 },
  { template: 'Gm7', offset: 2 },
];

function buildMinor7Chord(name, rootFret) {
  return buildChord(name, M7_OFFSETS.map(({ template, offset }) => {
    const fret = (rootFret + offset - 1 + 12) % 12 + 1;
    return { template, fret: fret === 12 ? 0 : fret };
  }));
}

const m7Chords = {
  Am7: buildMinor7Chord('Am7', 12),
  'A#m7': buildMinor7Chord('A#m7', 1),
  Bbm7: buildMinor7Chord('Bbm7', 1),
  Bm7: buildMinor7Chord('Bm7', 2),
  Cm7: buildMinor7Chord('Cm7', 3),
  'C#m7': buildMinor7Chord('C#m7', 4),
  Dbm7: buildMinor7Chord('Dbm7', 4),
  Dm7: buildMinor7Chord('Dm7', 5),
  'D#m7': buildMinor7Chord('D#m7', 6),
  Ebm7: buildMinor7Chord('Ebm7', 6),
  Em7: buildMinor7Chord('Em7', 7),
  Fm7: buildMinor7Chord('Fm7', 8),
  'F#m7': buildMinor7Chord('F#m7', 9),
  Gbm7: buildMinor7Chord('Gbm7', 9),
  Gm7: buildMinor7Chord('Gm7', 10),
  'G#m7': buildMinor7Chord('G#m7', 11),
  Abm7: buildMinor7Chord('Abm7', 11),
};

const maj7SlashChords = {
  'A7M/E': buildMaj7SlashChord('A7M/E', 4),
  'A#7M/F': buildMaj7SlashChord('A#7M/F', 5),
  'Bb7M/F': buildMaj7SlashChord('Bb7M/F', 5),
  'B7M/F#': buildMaj7SlashChord('B7M/F#', 6),
  'C7M/G': buildMaj7SlashChord('C7M/G', 7),
  'C#7M/G#': buildMaj7SlashChord('C#7M/G#', 8),
  'Db7M/Ab': buildMaj7SlashChord('Db7M/Ab', 8),
  'D7M/A': buildMaj7SlashChord('D7M/A', 9),
  'D#7M/A#': buildMaj7SlashChord('D#7M/A#', 10),
  'Eb7M/Bb': buildMaj7SlashChord('Eb7M/Bb', 10),
  'E7M/B': buildMaj7SlashChord('E7M/B', 11),
  'F7M/C': buildMaj7SlashChord('F7M/C', 0),
  'F#7M/C#': buildMaj7SlashChord('F#7M/C#', 1),
  'Gb7M/Db': buildMaj7SlashChord('Gb7M/Db', 1),
  'G7M/D': buildMaj7SlashChord('G7M/D', 2),
  'G#7M/D#': buildMaj7SlashChord('G#7M/D#', 3),
  'Ab7M/Eb': buildMaj7SlashChord('Ab7M/Eb', 3),
};

const majorChords = {
  A: [...buildMajorChord('A', 5), buildSpecialChord('A', specialShapes.A, 5)],
  'A#': buildMajorChord('A#', 6),
  Bb: buildMajorChord('Bb', 6),
  B: buildMajorChord('B', 7),
  C: buildMajorChord('C', 8),
  'C#': buildMajorChord('C#', 9),
  'Db': buildMajorChord('Db', 9),
  D: buildMajorChord('D', 10),
  'D#': buildMajorChord('D#', 11),
  'Eb': buildMajorChord('Eb', 11),
  E: buildMajorChord('E', 12),
  F: buildMajorChord('F', 1),
  'F#': buildMajorChord('F#', 2),
  Gb: buildMajorChord('Gb', 2),
  G: [...buildMajorChord('G', 3), buildSpecialChord('G', specialShapes.G, 0)],
  'G#': buildMajorChord('G#', 4),
  Ab: buildMajorChord('Ab', 4),
};

export const chords = {
  ...majorChords,
  Am: buildChord('Am', [
    { template: 'Am', fret: 0 },
  ]),
  Em: buildChord('Em', [
    { template: 'Em', fret: 0 },
    { template: 'Am', fret: 7 },
    { template: 'Em', fret: 12 },
    { template: 'Dm', fret: 14 },
  ]),
  Dm: buildChord('Dm', [
    { template: 'Dm', fret: 0 },
    { template: 'Am', fret: 5 },
    { template: 'Em', fret: 10 },
    { template: 'Dm', fret: 12 },
  ]),
  Bm: [{
    metadata: { name: 'Bm', variant: 0, strings: ['x', 'bass', 'open', 'open', 'open', 'open'] },
    shape: [
      { type: 'bar', casa: 2, cordaFim: 'A', cordaInicio: 'e' },
      { text: '2', casa: 3, corda: 'B' },
      { text: '3', casa: 4, corda: 'G' },
      { text: '4', casa: 4, corda: 'D' },
    ],
  },
  ...buildChord('Bm', [
    { template: 'Em', fret: 7 },
    { template: 'Dm', fret: 9 },
  ]).map((v, i) => ({ ...v, metadata: { ...v.metadata, variant: i + 1 } })),
  ],
  Bbm: buildChord('Bbm', [
    { template: 'Am', fret: 1 },
    { template: 'Em', fret: 6 },
    { template: 'Dm', fret: 8 },
  ]),
  Cm: buildChord('Cm', [
    { template: 'Am', fret: 3 },
    { template: 'Em', fret: 8 },
    { template: 'Dm', fret: 10 },
  ]),
  'C#m': buildChord('C#m', [
    { template: 'Am', fret: 4 },
    { template: 'Em', fret: 9 },
    { template: 'Dm', fret: 11 },
  ]),
  Fm: buildChord('Fm', [
    { template: 'Em', fret: 1 },
    { template: 'Am', fret: 8 },
    { template: 'Dm', fret: 3 },
  ]),
  'F#m': buildChord('F#m', [
    { template: 'Em', fret: 2 },
    { template: 'Am', fret: 9 },
    { template: 'Dm', fret: 4 },
  ]),
  D9: buildChord('D9', [
    { template: 'D9', fret: 0 },
    { template: 'A9', fret: 5 },
  ]),
  E9: buildChord('E9', [
    { template: 'E9', fret: 0 },
    { template: 'D9', fret: 2 },
    { template: 'A9', fret: 7 },
  ]),
  F9: buildChord('F9', [
    { template: 'E9', fret: 1 },
    { template: 'D9', fret: 3 },
    { template: 'A9', fret: 8 },
  ]),
  G9: buildChord('G9', [
    { template: 'E9', fret: 3 },
    { template: 'D9', fret: 5 },
    { template: 'A9', fret: 10 },
  ]),
  A9: buildChord('A9', [
    { template: 'E9', fret: 5 },
    { template: 'D9', fret: 7 },
    { template: 'A9', fret: 12 },
  ]),
  B9: buildChord('B9', [
    { template: 'E9', fret: 7 },
    { template: 'D9', fret: 9 },
    { template: 'A9', fret: 2 },
  ]),
  C9: [...buildChord('C9', [
    { template: 'E9', fret: 8 },
    { template: 'D9', fret: 10 },
    { template: 'A9', fret: 3 },
  ]), buildSpecialChord('C9', specialShapes.C9, 0)],
  ...m7Chords,
  ...maj7SlashChords,
};
