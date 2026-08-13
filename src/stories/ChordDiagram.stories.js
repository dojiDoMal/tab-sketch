import { renderChord, chords } from '../index.js';

// Build variant options map: { chordName: [0, 1, 2, ...] }
const variantOptionsMap = Object.fromEntries(
  Object.entries(chords).map(([name, variants]) => [
    name,
    variants.map((_, i) => i),
  ])
);

// Max variant across all chords (for the global argType range)
const maxVariant = Math.max(...Object.values(chords).map((v) => v.length - 1));

export default {
  title: 'ChordDiagram',
  argTypes: {
    chord: {
      control: 'select',
      options: Object.keys(chords),
      description: 'Chord name',
    },
    variant: {
      control: { type: 'select' },
      options: variantOptionsMap[Object.keys(chords)[0]],
      description: 'Chord variant (limited to available variants for the selected chord)',
    },
    capo: {
      control: 'number',
      description: 'Capo fret position (0 = no capo)',
    },
    tuning: {
      control: { type: 'number', min: -11, max: 11 },
      description: 'Tuning offset in semitones (e.g. -2 = 1 tom abaixo)',
    },
    titleColor: {
      control: 'color',
      description: 'Custom color for the chord name title',
    },
  },
};

export const SingleChord = {
  args: {
    chord: 'A',
    variant: 0,
    capo: 0,
    tuning: 0,
    titleColor: '',
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: variantOptionsMap['A'],
      description: 'Chord variant (limited to available variants for the selected chord)',
    },
  },
  render: ({ chord, variant, capo, tuning, titleColor }, { argTypes }) => {
    const container = document.createElement('div');
    const variants = chords[chord] || [];
    const maxVariant = variants.length - 1;
    const safeVariant = Math.min(Math.max(variant || 0, 0), maxVariant);
    const chordData = variants[safeVariant];

    if (chordData) {
      const options = {};
      if (capo) options.capo = capo;
      if (tuning) options.tuning = tuning;
      if (titleColor) options.titleColor = titleColor;
      renderChord(container, chordData, options);
    } else {
      container.textContent = `Chord "${chord}" not found`;
    }
    return container;
  },
};

export const AllChords = {
  args: {
    titleColor: '',
  },
  render: ({ titleColor }) => {
    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.flexWrap = 'wrap';
    // wrapper.style.gap = '24px';
    wrapper.style.padding = '16px';

    Object.entries(chords).forEach(([name, variants]) => {
      variants.forEach((chordData) => {
        const container = document.createElement('div');
        const options = {};
        if (titleColor) options.titleColor = titleColor;
        renderChord(container, chordData, options);
        wrapper.appendChild(container);
      });
    });

    return wrapper;
  },
};

export const WithCapo = {
  args: {
    capo: 2,
    titleColor: '',
  },
  argTypes: {
    capo: {
      control: { type: 'number', min: 1, max: 12 },
      description: 'Capo fret position',
    },
  },
  render: ({ capo, titleColor }) => {
    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.flexWrap = 'wrap';
    //wrapper.style.gap = '24px';
    wrapper.style.padding = '16px';

    const sampleChords = ['Am', 'C', 'G', 'Em', 'D'];
    sampleChords.forEach((name) => {
      const chordData = chords[name]?.[0];
      if (chordData) {
        const container = document.createElement('div');
        const options = { capo };
        if (titleColor) options.titleColor = titleColor;
        renderChord(container, chordData, options);
        wrapper.appendChild(container);
      }
    });

    return wrapper;
  },
};

export const WithBar = {
  args: {
    titleColor: '',
  },
  render: ({ titleColor }) => {
    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.flexWrap = 'wrap';
    //wrapper.style.gap = '24px';
    wrapper.style.padding = '16px';

    const barChords = Object.values(chords)
      .flat()
      .filter((c) => c.shape.some((s) => s.type === 'bar'));

    barChords.forEach((chordData) => {
      const container = document.createElement('div');
      const options = {};
      if (titleColor) options.titleColor = titleColor;
      renderChord(container, chordData, options);
      wrapper.appendChild(container);
    });

    return wrapper;
  },
};

export const WithTuning = {
  args: {
    tuning: -2,
    titleColor: '',
  },
  argTypes: {
    tuning: {
      control: { type: 'number', min: -11, max: 11 },
      description: 'Tuning offset in semitones (e.g. -2 = 1 tom abaixo)',
    },
  },
  render: ({ tuning, titleColor }) => {
    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.flexWrap = 'wrap';
    //wrapper.style.gap = '24px';
    wrapper.style.padding = '16px';

    const sampleChords = ['Bm', 'D', 'G', 'A', 'Em', 'F'];
    sampleChords.forEach((name) => {
      const chordData = chords[name]?.[0];
      if (chordData) {
        const container = document.createElement('div');
        const options = { tuning };
        if (titleColor) options.titleColor = titleColor;
        renderChord(container, chordData, options);
        wrapper.appendChild(container);
      }
    });

    return wrapper;
  },
};
