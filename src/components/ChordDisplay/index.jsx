import React, { useRef, useEffect } from 'react';
import { useSectionContext } from '../../contexts/SectionContext.jsx';
import { renderChord } from '../../render.js';
import { chords } from '../../chords.js';
import "./styles.css"

/**
 * ChordDisplay component — renders a chord diagram using the existing renderChord engine.
 * Reads capo, tuning, and chordTitleColor from Section context if available.
 *
 * @param {object} props
 * @param {string} props.chord - Chord name (e.g. 'Am', 'G', 'D#9')
 * @param {number} [props.shapeVariant=0] - Which shape variant to render (index into the chord's variants array, -1 for last)
 * @param {number} [props.capo] - Override capo from Section context
 * @param {number} [props.tuning] - Override tuning from Section context
 * @param {string} [props.titleColor] - Override chordTitleColor from Section context
 */
export function ChordDisplay({ chord, shapeVariant = 0, capo, tuning, titleColor }) {
  const containerRef = useRef(null);
  const section = useSectionContext();

  const effectiveCapo = capo ?? section.capo;
  const effectiveTuning = tuning ?? section.tuning;
  const effectiveTitleColor = titleColor ?? section.chordTitleColor;

  useEffect(() => {
    if (!containerRef.current || !chord) return;

    const variants = chords[chord];
    if (!variants || variants.length === 0) {
      containerRef.current.innerHTML = `<span style="color: #f66">Chord "${chord}" not found</span>`;
      return;
    }

    const idx = shapeVariant === -1 ? variants.length - 1 : shapeVariant;
    const chordData = variants[idx];

    if (!chordData) {
      containerRef.current.innerHTML = `<span style="color: #f66">Variant ${shapeVariant} not found for "${chord}"</span>`;
      return;
    }

    renderChord(containerRef.current, chordData, {
      capo: effectiveCapo,
      tuning: effectiveTuning,
      titleColor: effectiveTitleColor,
    });
  }, [chord, shapeVariant, effectiveCapo, effectiveTuning, effectiveTitleColor]);

  return <div ref={containerRef} />;
}
