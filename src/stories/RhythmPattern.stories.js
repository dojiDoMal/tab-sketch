import { renderRhythm } from '../index.js';

export default {
  title: 'RhythmPattern',
  argTypes: {
    bpm: {
      control: { type: 'number', min: 40, max: 220 },
      description: 'Beats per minute',
    },
    beats: {
      control: { type: 'number', min: 2, max: 8 },
      description: 'Number of beats (time signature numerator)',
    },
    noteValue: {
      control: { type: 'select' },
      options: [2, 4, 8],
      description: 'Note value (time signature denominator)',
    },
    pattern: {
      control: 'text',
      description: 'Rhythm pattern using D (down), U (up), X (mute), _ (empty). Comma-separated.',
    },
  },
};

function parsePattern(patternStr) {
  return patternStr
    .split(',')
    .map((s) => s.trim().toUpperCase())
    .filter((s) => ['D', 'U', 'X', '_'].includes(s));
}

export const Default = {
  args: {
    bpm: 72,
    beats: 4,
    noteValue: 4,
    pattern: 'D, _, _, U, X, U, D, _, _, U, D, U, X, U, D, U',
  },
  render: ({ bpm, beats, noteValue, pattern }) => {
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.flexWrap = 'wrap';
    renderRhythm(container, {
      bpm,
      timeSignature: [beats, noteValue],
      pattern: parsePattern(pattern),
    });
    return container;
  },
};

export const Simple = {
  args: {
    bpm: 90,
    beats: 4,
    noteValue: 4,
    pattern: 'D, _, D, U, D, _, D, U, D, _, D, U, D, _, D, U',
  },
  render: ({ bpm, beats, noteValue, pattern }) => {
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.flexWrap = 'wrap';
    renderRhythm(container, {
      bpm,
      timeSignature: [beats, noteValue],
      pattern: parsePattern(pattern),
    });
    return container;
  },
};

export const Reggae = {
  args: {
    bpm: 80,
    beats: 4,
    noteValue: 4,
    pattern: 'X, _, U, _, X, _, U, _, X, _, U, _, X, _, U, _',
  },
  render: ({ bpm, beats, noteValue, pattern }) => {
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.flexWrap = 'wrap';
    renderRhythm(container, {
      bpm,
      timeSignature: [beats, noteValue],
      pattern: parsePattern(pattern),
    });
    return container;
  },
};

export const Waltz3_4 = {
  name: '3/4 Waltz',
  args: {
    bpm: 100,
    beats: 3,
    noteValue: 4,
    pattern: 'D, _, _, U, D, U, D, _, _, U, D, U',
  },
  render: ({ bpm, beats, noteValue, pattern }) => {
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.flexWrap = 'wrap';
    renderRhythm(container, {
      bpm,
      timeSignature: [beats, noteValue],
      pattern: parsePattern(pattern),
    });
    return container;
  },
};
