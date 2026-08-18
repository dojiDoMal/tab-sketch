import { renderLyrics } from '../index.js';

export default {
  title: 'LyricsChords',
  argTypes: {
    chordColor: {
      control: 'color',
      description: 'Custom color for chord names',
    },
  },
};

const sampleLyrics = {
  lines: [
    {
      segments: [
        { chord: 'G', text: 'Mesmo', align: 'flex-start' },
        { text: 'que você' },
      ],
    },
    {
      segments: [
        { text: 'Não caia na minha cantada' },
      ],
    },
    {
      segments: [
        { text: 'Mesmo que você conheça outro cara' },
      ],
    },
    {
      segments: [
        { text: 'Na' },
        { chord: 'C9', text: 'fila', align: 'center' },
        { text: 'de um banco' },
      ],
    },
    {
      segments: [
        { text: 'Um tal de Fernando' },
      ],
    },
    {
      segments: [
        { text: 'Um lance, assim, sem graça' },
      ],
    },
  ],
};

export const Default = {
  args: {
    chordColor: '',
  },
  render: ({ chordColor }) => {
    const container = document.createElement('div');
    const options = {};
    if (chordColor) options.chordColor = chordColor;
    renderLyrics(container, sampleLyrics, options);
    return container;
  },
};

export const CustomChordColor = {
  args: {
    chordColor: '#ffcc00',
  },
  render: ({ chordColor }) => {
    const container = document.createElement('div');
    renderLyrics(container, sampleLyrics, { chordColor });
    return container;
  },
};

export const AlignmentVariations = {
  args: {
    chordColor: '',
  },
  render: ({ chordColor }) => {
    const container = document.createElement('div');
    const options = {};
    if (chordColor) options.chordColor = chordColor;

    const data = {
      lines: [
        {
          segments: [
            { chord: 'Am', text: 'flex-start', align: 'flex-start' },
            { chord: 'C', text: 'center', align: 'center' },
            { chord: 'G', text: 'flex-end', align: 'flex-end' },
          ],
        },
        {
          segments: [
            { text: 'Linha sem acorde nenhum' },
          ],
        },
        {
          segments: [
            { chord: 'D', text: 'Palavra', align: 'flex-start' },
            { text: 'com continuação sem acorde' },
          ],
        },
      ],
    };

    renderLyrics(container, data, options);
    return container;
  },
};
