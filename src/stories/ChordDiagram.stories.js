import { renderChord, chords } from '../index.js';

export default {
  title: 'ChordDiagram',
  argTypes: {
    chord: {
      control: 'select',
      options: Object.keys(chords),
      description: 'Chord name',
    },
    variant: {
      control: 'number',
      description: 'Chord variant (0-based index)',
    },
    capo: {
      control: 'number',
      description: 'Capo fret position (0 = no capo)',
    },
  },
};

export const SingleChord = {
  args: {
    chord: 'A',
    variant: 0,
    capo: 0,
  },
  render: ({ chord, variant, capo }) => {
    const container = document.createElement('div');
    const chordData = chords[chord]?.[variant] || chords[chord]?.[0];
    if (chordData) {
      const options = capo ? { capo } : {};
      renderChord(container, chordData, options);
    } else {
      container.textContent = `Chord "${chord}" not found`;
    }
    return container;
  },
};

export const AllChords = {
  render: () => {
    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.flexWrap = 'wrap';
    wrapper.style.gap = '24px';
    wrapper.style.padding = '16px';

    Object.entries(chords).forEach(([name, variants]) => {
      variants.forEach((chordData) => {
        const container = document.createElement('div');
        renderChord(container, chordData);
        wrapper.appendChild(container);
      });
    });

    return wrapper;
  },
};

export const WithCapo = {
  args: {
    capo: 2,
  },
  argTypes: {
    capo: {
      control: { type: 'number', min: 1, max: 12 },
      description: 'Capo fret position',
    },
  },
  render: ({ capo }) => {
    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.flexWrap = 'wrap';
    wrapper.style.gap = '24px';
    wrapper.style.padding = '16px';

    const sampleChords = ['Am', 'C', 'G', 'Em', 'D'];
    sampleChords.forEach((name) => {
      const chordData = chords[name]?.[0];
      if (chordData) {
        const container = document.createElement('div');
        renderChord(container, chordData, { capo });
        wrapper.appendChild(container);
      }
    });

    return wrapper;
  },
};

export const WithBar = {
  render: () => {
    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.flexWrap = 'wrap';
    wrapper.style.gap = '24px';
    wrapper.style.padding = '16px';

    const barChords = Object.values(chords)
      .flat()
      .filter((c) => c.shape.some((s) => s.type === 'bar'));

    barChords.forEach((chordData) => {
      const container = document.createElement('div');
      renderChord(container, chordData);
      wrapper.appendChild(container);
    });

    return wrapper;
  },
};
