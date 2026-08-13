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

// Shape templates for 9th chords
const ninthShapes = {
  // D9 shape: bass em D, dedos em G(+2), B(+3), e aberta
  D9: {
    strings: ['x', 'x', 'bass', 'open', 'open', 'open'],
    shape: [
      { type: 'bar', cordaInicio: 'e', cordaFim: 'D', offset: 0 },
      { text: '1', corda: 'G', offset: 2 },
      { text: '2', corda: 'B', offset: 3 },
    ],
  },
  // E9 shape: bar completo (E→e), dedos em A(+2), G(+1), D(+4)
  E9: {
    strings: ['bass', 'open', 'open', 'open', 'open', 'open'],
    shape: [
      { type: 'bar', cordaInicio: 'e', cordaFim: 'E', offset: 0 },
      { text: '1', corda: 'G', offset: 1 },
      { text: '2', corda: 'A', offset: 2 },
      { text: '3', corda: 'D', offset: 4 },
    ],
  },
  A9: {
    strings: ['x', 'bass', 'open', 'open', 'open', 'open'],
    shape: [
      { type: 'bar', cordaInicio: 'e', cordaFim: 'A', offset: 0 },
      { text: '1', corda: 'D', offset: 2 },
      { text: '2', corda: 'G', offset: 2 },
    ],
  },
};

// Shape templates for major chords
const majorShapes = {
  // E shape: bar completo (E→e), dedos em G(+1), A(+2), D(+2)
  E: {
    strings: ['bass', 'open', 'open', 'open', 'open', 'open'],
    shape: [
      { type: 'bar', cordaInicio: 'e', cordaFim: 'E', offset: 0 },
      { text: '1', corda: 'G', offset: 1 },
      { text: '2', corda: 'A', offset: 2 },
      { text: '3', corda: 'D', offset: 2 },
    ],
  },
  A: {
    strings: ['x', 'bass', 'open', 'open', 'open', 'open'],
    shape: [
      { type: 'bar', cordaInicio: 'e', cordaFim: 'A', offset: 0 },
      { text: '1', corda: 'D', offset: 2 },
      { text: '2', corda: 'G', offset: 2 },
      { text: '3', corda: 'B', offset: 2 },
    ],
  },
  D: {
    strings: ['x', 'x', 'bass', 'open', 'open', 'open'],
    shape: [
      { type: 'bar', cordaInicio: 'e', cordaFim: 'D', offset: 0 },
      { text: '1', corda: 'G', offset: 2 },
      { text: '3', corda: 'B', offset: 3 },
      { text: '2', corda: 'e', offset: 2 },
    ],
  },
  G: {
    strings: ['bass', 'open', 'open', 'open', 'open', 'open'],
    shape: [
      { type: 'bar', cordaInicio: 'e', cordaFim: 'D', offset: 0 },
      { text: '2', corda: 'E', offset: 3 },
      { text: '1', corda: 'A', offset: 2 },
      { text: '3', corda: 'e', offset: 3 },
    ],
  },
};

/**
 * Builds chord variants from shape templates + fret offset.
 * Output format is identical to manually declared chords.
 */
function buildChord(name, variants) {
  return variants.map((v, i) => {
    const template = minorShapes[v.template] || majorShapes[v.template] || ninthShapes[v.template];
    return {
      metadata: { name, variant: i, strings: template.strings },
      shape: template.shape.map(({ offset, ...rest }) => ({
        ...rest,
        casa: v.fret + offset,
      })),
    };
  });
}

export const chords = {
  // --- Acordes com shapes únicos (abertos) ---
  Am: [{
    metadata: { name: 'Am', variant: 0, strings: ['x', 'bass', 'open', 'open', 'open', 'open'] },
    shape: [
      { text: '1', casa: 1, corda: 'B' },
      { text: '2', casa: 2, corda: 'G' },
      { text: '3', casa: 2, corda: 'D' },
    ],
  }],
  Em: [{
    metadata: { name: 'Em', variant: 0, strings: ['bass', 'open', 'open', 'open', 'open', 'open'] },
    shape: [
      { text: '1', casa: 2, corda: 'A' },
      { text: '2', casa: 2, corda: 'D' },
    ],
  },
  ...buildChord('Em', [
    { template: 'Am', fret: 7 },
    { template: 'Em', fret: 12 },
    { template: 'Dm', fret: 14 },
  ]).map((v, i) => ({ ...v, metadata: { ...v.metadata, variant: i + 1 } })),
  ],
  E: [{
    metadata: { name: 'E', variant: 0, strings: ['bass', 'open', 'open', 'open', 'open', 'open'] },
    shape: [
      { text: '1', casa: 1, corda: 'G' },
      { text: '2', casa: 2, corda: 'A' },
      { text: '3', casa: 2, corda: 'D' },
    ],
  }],
  F: buildChord('F', [
    { template: 'E', fret: 1 },
    { template: 'G', fret: 10 },
    { template: 'D', fret: 3 },
    { template: 'A', fret: 8 },
  ]),
  'F#': buildChord('F#', [
    { template: 'E', fret: 2 },
    { template: 'G', fret: 11 },
    { template: 'D', fret: 4 },
    { template: 'A', fret: 9 },
  ]),
  'G#': buildChord('G#', [
    { template: 'E', fret: 4 },
    { template: 'G', fret: 1 },
    { template: 'D', fret: 6 },
    { template: 'A', fret: 11 },
  ]),
  'A#': buildChord('A#', [
    { template: 'E', fret: 6 },
    { template: 'G', fret: 3 },
    { template: 'D', fret: 8 },
    { template: 'A', fret: 1 },
  ]),
  B: buildChord('B', [
    { template: 'E', fret: 7 },
    { template: 'G', fret: 4 },
    { template: 'D', fret: 9 },
    { template: 'A', fret: 2 },
  ]),
  'C#': buildChord('C#', [
    { template: 'E', fret: 9 },
    { template: 'G', fret: 6 },
    { template: 'D', fret: 11 },
    { template: 'A', fret: 4 },
  ]),
  'F/C': [{
    metadata: {
      name: 'F/C',
      variant: 0,
      strings: ['x', 'bass', 'open', 'open', 'open', 'x']
    },
    shape: [
      { text: '1', casa: 1, corda: 'B' },
      { text: '2', casa: 2, corda: 'G' },
      { text: '4', casa: 3, corda: 'D' },
      { text: '3', casa: 3, corda: 'A' },
    ],
  },
  {
    metadata: {
      name: 'F/C',
      variant: 1,
      strings: ['x', 'bass', 'x', 'open', 'open', 'open']
    },
    shape: [
      { text: '3', casa: 5, corda: 'e' },
      { text: '4', casa: 6, corda: 'B' },
      { text: '2', casa: 5, corda: 'G' },
      { text: '1', casa: 3, corda: 'A' },
    ],
  }],
  A: [
    {
      metadata: { name: 'A', variant: 0, strings: ['x', 'bass', 'open', 'open', 'open', 'open'] },
      shape: [
        { text: '1', casa: 2, corda: 'D' },
        { text: '2', casa: 2, corda: 'G' },
        { text: '3', casa: 2, corda: 'B' },
      ],
    },
    {
      metadata: { name: 'A', variant: 1, strings: ['x', 'bass', 'open', 'open', 'open', 'open'] },
      shape: [
        { type: 'bar', casa: 2, cordaInicio: 'B', cordaFim: 'D' },
      ],
    },
    ...buildChord('A', [
      { template: 'E', fret: 5 },
      { template: 'G', fret: 2 },
      { template: 'D', fret: 7 },
      { template: 'A', fret: 12 },
    ]).map((v, i) => ({ ...v, metadata: { ...v.metadata, variant: i + 2 } })),
  ],
  D: [{
    metadata: { name: 'D', variant: 0, strings: ['x', 'x', 'bass', 'open', 'open', 'open'] },
    shape: [
      { text: '1', casa: 2, corda: 'G' },
      { text: '2', casa: 2, corda: 'e' },
      { text: '3', casa: 3, corda: 'B' },
    ],
  },
  ...buildChord('D', [
    { template: 'E', fret: 10 },
    { template: 'G', fret: 7 },
    { template: 'D', fret: 12 },
    { template: 'A', fret: 5 },
  ]).map((v, i) => ({ ...v, metadata: { ...v.metadata, variant: i + 1 } })),
  ],
  'D#': [{
    metadata: { name: 'D#', variant: 0, strings: ['x', 'x', 'bass', 'open', 'open', 'open'] },
    shape: [
      { type: 'bar', casa: 1, cordaFim: 'D', cordaInicio: 'e' },
      { text: '3', casa: 3, corda: 'e' },
      { text: '4', casa: 4, corda: 'B' },
      { text: '2', casa: 3, corda: 'G' },
    ],
  }],
  Dm: [{
    metadata: { name: 'Dm', variant: 0, strings: ['x', 'x', 'bass', 'open', 'open', 'open'] },
    shape: [
      { text: '1', casa: 1, corda: 'e' },
      { text: '2', casa: 2, corda: 'G' },
      { text: '3', casa: 3, corda: 'B' },
    ],
  },
  ...buildChord('Dm', [
    { template: 'Am', fret: 5 },
    { template: 'Em', fret: 10 },
    { template: 'Dm', fret: 12 },
  ]).map((v, i) => ({ ...v, metadata: { ...v.metadata, variant: i + 1 } })),
  ],
  G: [{
    metadata: { name: 'G', variant: 0, strings: ['bass', 'open', 'open', 'open', 'open', 'open'] },
    shape: [
      { text: '1', casa: 2, corda: 'A' },
      { text: '2', casa: 3, corda: 'E' },
      { text: '3', casa: 3, corda: 'e' },
    ],
  },
  ...buildChord('G', [
    { template: 'E', fret: 3 },
    { template: 'G', fret: 12 },
    { template: 'D', fret: 5 },
    { template: 'A', fret: 10 },
  ]).map((v, i) => ({ ...v, metadata: { ...v.metadata, variant: i + 1 } })),
  ],
  C: [{
    metadata: { name: 'C', variant: 0, strings: ['x', 'bass', 'open', 'open', 'open', 'open'] },
    shape: [
      { text: '1', casa: 1, corda: 'B' },
      { text: '2', casa: 2, corda: 'D' },
      { text: '3', casa: 3, corda: 'A' },
    ],
  },
  ...buildChord('C', [
    { template: 'E', fret: 8 },
    { template: 'G', fret: 5 },
    { template: 'D', fret: 10 },
    { template: 'A', fret: 3 },
  ]).map((v, i) => ({ ...v, metadata: { ...v.metadata, variant: i + 1 } })),
  ],

  // --- Acordes menores gerados a partir dos templates ---
  Bm: [{
    metadata: { name: 'Bm', variant: 0, strings: ['x', 'bass', 'open', 'open', 'open', 'open'] },
    shape: [
      { type: 'bar', casa: 2, cordaFim: 'A', cordaInicio: 'e' },
      { text: '1', casa: 3, corda: 'B' },
      { text: '2', casa: 4, corda: 'G' },
      { text: '3', casa: 4, corda: 'D' },
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

  // --- Acordes com 9ª gerados a partir dos shapes D9, E9 e A9 ---
  D9: [{
    metadata: { name: 'D9', variant: 0, strings: ['x', 'x', 'bass', 'open', 'open', 'open'] },
    shape: [
      { text: '1', casa: 2, corda: 'G' },
      { text: '2', casa: 3, corda: 'B' },
    ],
  },
  ...buildChord('D9', [
    { template: 'A9', fret: 5 },
  ]).map((v, i) => ({ ...v, metadata: { ...v.metadata, variant: i + 1 } })),
  ],
  E9: [{
    metadata: { name: 'E9', variant: 0, strings: ['bass', 'open', 'open', 'open', 'open', 'open'] },
    shape: [
      { text: '1', casa: 1, corda: 'G' },
      { text: '2', casa: 2, corda: 'A' },
      { text: '3', casa: 4, corda: 'D' },
    ],
  },
  ...buildChord('E9', [
    { template: 'D9', fret: 2 },
    { template: 'A9', fret: 7 },
  ]).map((v, i) => ({ ...v, metadata: { ...v.metadata, variant: i + 1 } })),
  ],
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
  C9: buildChord('C9', [
    { template: 'E9', fret: 8 },
    { template: 'D9', fret: 10 },
    { template: 'A9', fret: 3 },
  ]),
};
