import React from 'react';
import SectionContext from '../../contexts/SectionContext.jsx';

/**
 * Section component — provides shared context (capo, tuning, bpm, chordTitleColor)
 * to child components like ChordDisplay, RhythmDisplay, and LyricsDisplay.
 *
 * @param {object} props
 * @param {number} [props.capo] - Capo fret position
 * @param {number} [props.tuning] - Tuning offset in semitones (negative = down)
 * @param {number} [props.bpm] - Beats per minute
 * @param {string} [props.chordTitleColor] - CSS color for chord titles
 * @param {React.ReactNode} props.children
 */
export function Section({ capo, tuning, bpm, chordTitleColor, children }) {
  const value = { capo, tuning, bpm, chordTitleColor };

  return (
    <SectionContext.Provider value={value}>
      {children}
    </SectionContext.Provider>
  );
}
