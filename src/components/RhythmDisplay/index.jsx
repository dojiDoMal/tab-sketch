import React, { useRef, useEffect } from 'react';
import { useSectionContext } from '../../contexts/SectionContext.jsx';
import { renderRhythm } from '../../rhythm.js';
import "./styles.css"

/**
 * Parses a pattern string into an array of stroke types.
 *
 * Accepts characters: D/B (down/baixo), U/C (up/cima), X (mute), 0/- (empty/rest)
 * Input is normalized to lowercase before mapping.
 *
 * Examples:
 *   "D--UXUD--UDUXUD" → ['D','_','_','U','X','U','D','_','_','U','D','U','X','U','D']
 *   "B--CXCB--CBCXCB" → ['D','_','_','U','X','U','D','_','_','U','D','U','X','U','D']
 *
 * @param {string} patternStr
 * @returns {string[]}
 */
function parsePattern(patternStr) {
  const normalized = patternStr.toLowerCase();
  return [...normalized].map((ch) => {
    switch (ch) {
      case 'd':
      case 'b': // baixo = down
        return 'D';
      case 'u':
      case 'c': // cima = up
        return 'U';
      case 'x':
        return 'X';
      case '0':
      case '-':
      case '_':
        return '_';
      default:
        return '_';
    }
  });
}

/**
 * RhythmDisplay component — renders a rhythm pattern using the existing renderRhythm engine.
 * Reads bpm from Section context if available.
 *
 * @param {object} props
 * @param {string} props.pattern - Pattern string (e.g. "D--UXUD--UDUXUD")
 * @param {[number, number]} [props.timeSignature=[4,4]] - Time signature
 * @param {number} [props.bpm] - Override bpm from Section context
 * @param {boolean} [props.showBpmLabel=true] - Whether to display the BPM label
 * @param {boolean} [props.dense=false] - When true, uses fit-content width instead of full width
 */
export function RhythmDisplay({ pattern, timeSignature = [4, 4], bpm, showBpmLabel = true, dense = false }) {
  const containerRef = useRef(null);
  const section = useSectionContext();

  const effectiveBpm = bpm ?? section.bpm;

  useEffect(() => {
    if (!containerRef.current || !pattern) return;

    const parsedPattern = parsePattern(pattern);

    renderRhythm(containerRef.current, {
      bpm: effectiveBpm || 120,
      timeSignature,
      pattern: parsedPattern,
      showBpmLabel,
      dense,
    });
  }, [pattern, timeSignature, effectiveBpm, showBpmLabel, dense]);

  return <div ref={containerRef} />;
}
