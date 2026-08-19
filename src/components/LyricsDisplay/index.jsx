import React, { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSectionContext } from '../../contexts/SectionContext.jsx';
import { renderLyrics } from '../../lyrics.js';
import { transposeChord } from '../../render.js';
import { renderChord } from '../../render.js';
import { chords } from '../../chords.js';
import "./styles.css"

/**
 * Parses the custom lyrics notation into the lyricsData structure expected by renderLyrics.
 *
 * Notation:
 *   [A#]Mesmo        → chord="A#", align="center" (default)
 *   [A#<]Mesmo       → chord="A#", align="flex-start"
 *   [D#9>]Vai        → chord="D#9", align="flex-end"
 *   [D#9|D#m>]word   → multiple chords on same word
 *   plain text       → no chord, just text
 *
 * @param {string} text - Raw lyrics notation
 * @returns {{ lines: Array<{ segments: Array<{ chord?: string|string[], text: string, align?: string }> }> }}
 */
function parseLyricsNotation(text) {
  const rawLines = text.split('\n');
  const lines = [];

  for (const rawLine of rawLines) {
    const trimmed = rawLine.trim();
    if (trimmed === '') continue;

    const segments = [];
    const regex = /\[([^\]]+)\]([^[]*)|([^[]+)/g;
    let match;

    while ((match = regex.exec(trimmed)) !== null) {
      if (match[3] !== undefined) {
        const plainText = match[3].trim();
        if (plainText) {
          segments.push({ text: plainText });
        }
      } else {
        const chordRaw = match[1];
        const textAfter = match[2] || '';

        let chordStr;
        let align = 'center';
        const lastChar = chordRaw[chordRaw.length - 1];

        if (lastChar === '<') {
          chordStr = chordRaw.slice(0, -1);
          align = 'flex-start';
        } else if (lastChar === '>') {
          chordStr = chordRaw.slice(0, -1);
          align = 'flex-end';
        } else {
          chordStr = chordRaw;
          align = 'center';
        }

        // Parse each chord token for optional :variant (e.g. "G:-1", "C9:3", "Am")
        function parseChordToken(token) {
          const colonIdx = token.lastIndexOf(':');
          if (colonIdx > 0) {
            const name = token.slice(0, colonIdx);
            const variant = parseInt(token.slice(colonIdx + 1), 10);
            if (!isNaN(variant)) {
              return { name, variant };
            }
          }
          return { name: token, variant: 0 };
        }

        const chordTokens = chordStr.includes('|') ? chordStr.split('|') : [chordStr];
        const parsed = chordTokens.map(parseChordToken);

        // chord field: string or string[] (just the names, for renderLyrics display)
        const chord = parsed.length === 1 ? parsed[0].name : parsed.map((p) => p.name);
        // variants field: number or number[] (for popup lookup)
        const variants = parsed.length === 1 ? parsed[0].variant : parsed.map((p) => p.variant);

        const words = textAfter.trim().split(/\s+/);
        const firstWord = words[0] || '';
        const rest = words.slice(1).join(' ');

        segments.push({ chord, variants, text: firstWord, align });

        if (rest) {
          segments.push({ text: rest });
        }
      }
    }

    if (segments.length > 0) {
      lines.push({ segments });
    }
  }

  return { lines };
}

/**
 * LyricsDisplay component — renders lyrics with inline chord notation.
 * On hover over a chord name, shows a popup with the chord diagram (ChordDisplay).
 *
 * @param {object} props
 * @param {string} [props.chordColor] - Override chordTitleColor from Section context
 * @param {boolean} [props.raw=false] - If true, disables chord notation parsing and renders plain text
 * @param {React.ReactNode} props.children - Lyrics text with chord notation
 */
export function LyricsDisplay({ chordColor, raw = false, children }) {
  const containerRef = useRef(null);
  const popupRef = useRef(null);
  const section = useSectionContext();
  const [popup, setPopup] = useState(null); // { chord, x, y }

  const effectiveChordColor = chordColor ?? section.chordTitleColor;
  const effectiveCapo = section.capo;
  const effectiveTuning = section.tuning;
  const totalOffset = (effectiveCapo || 0) + (effectiveTuning || 0);

  const text = typeof children === 'string' ? children : String(children || '');

  useEffect(() => {
    if (!containerRef.current || !text) return;

    // When raw mode is enabled, skip chord parsing entirely
    if (raw) {
      const rawLines = text.split('\n').filter((l) => l.trim() !== '');
      const lyricsData = { lines: rawLines.map((line) => ({ segments: [{ text: line.trim() }] })) };
      renderLyrics(containerRef.current, lyricsData, { chordColor: effectiveChordColor });
      return;
    }

    const lyricsData = parseLyricsNotation(text);

    // Store original (shape) chord names and variants before transposing
    const originalChords = [];
    for (const line of lyricsData.lines) {
      for (const segment of line.segments) {
        if (!segment.chord) continue;
        originalChords.push({
          names: Array.isArray(segment.chord) ? [...segment.chord] : [segment.chord],
          variants: Array.isArray(segment.variants) ? [...segment.variants] : [segment.variants ?? 0],
        });
      }
    }

    // Transpose chords based on capo + tuning
    if (totalOffset !== 0) {
      for (const line of lyricsData.lines) {
        for (const segment of line.segments) {
          if (!segment.chord) continue;
          if (Array.isArray(segment.chord)) {
            segment.chord = segment.chord.map((c) => transposeChord(c, totalOffset));
          } else {
            segment.chord = transposeChord(segment.chord, totalOffset);
          }
        }
      }
    }

    renderLyrics(containerRef.current, lyricsData, {
      chordColor: effectiveChordColor,
    });

    // Annotate rendered chord elements with original shape name and variant via data attributes
    const chordEls = containerRef.current.querySelectorAll('.lyrics-chord:not(.lyrics-chord--empty)');
    let chordIdx = 0;
    chordEls.forEach((el) => {
      const original = originalChords[chordIdx];
      if (original !== undefined) {
        if (original.names.length > 1) {
          // Multiple chords in a group — match by position within group
          el.dataset.shapeChord = original.names[0];
          el.dataset.shapeVariant = original.variants[0];
          const group = el.closest('.lyrics-chord-group');
          if (group) {
            const siblings = [...group.querySelectorAll('.lyrics-chord')];
            const idx = siblings.indexOf(el);
            if (idx >= 0 && idx < original.names.length) {
              el.dataset.shapeChord = original.names[idx];
              el.dataset.shapeVariant = original.variants[idx];
            }
          }
        } else {
          el.dataset.shapeChord = original.names[0];
          el.dataset.shapeVariant = original.variants[0];
        }
      }
      // Advance index only on last chord of each group
      const group = el.closest('.lyrics-chord-group');
      if (group) {
        const siblings = [...group.querySelectorAll('.lyrics-chord')];
        if (siblings.indexOf(el) === siblings.length - 1) {
          chordIdx++;
        }
      } else {
        chordIdx++;
      }
    });

    // Use event delegation on the container for chord hover
    const container = containerRef.current;

    const handleMouseOver = (e) => {
      const chordEl = e.target.closest('.lyrics-chord:not(.lyrics-chord--empty)');
      if (!chordEl || !container.contains(chordEl)) return;
      const shapeChord = chordEl.dataset.shapeChord;
      const shapeVariant = parseInt(chordEl.dataset.shapeVariant ?? '0', 10);
      if (!shapeChord) return;
      const rect = chordEl.getBoundingClientRect();
      setPopup({
        shapeChord,
        shapeVariant,
        x: rect.left + rect.width / 2,
        y: rect.top - 15,
      });
    };

    const handleMouseOut = (e) => {
      const chordEl = e.target.closest('.lyrics-chord:not(.lyrics-chord--empty)');
      if (!chordEl) return;
      // Check if we're leaving to another element inside the same chord
      const related = e.relatedTarget;
      if (related && chordEl.contains(related)) return;
      setPopup(null);
    };

    container.addEventListener('mouseover', handleMouseOver);
    container.addEventListener('mouseout', handleMouseOut);

    return () => {
      container.removeEventListener('mouseover', handleMouseOver);
      container.removeEventListener('mouseout', handleMouseOut);
    };
  }, [text, effectiveChordColor, totalOffset, raw]);

  // Render the chord popup into the popup container
  useEffect(() => {
    if (!popupRef.current) return;

    if (!popup) {
      popupRef.current.innerHTML = '';
      return;
    }

    // Use the original shape chord name to look up in the dictionary
    const shapeChord = popup.shapeChord;
    const shapeVariant = popup.shapeVariant ?? 0;
    const variantList = chords[shapeChord];
    if (!variantList || variantList.length === 0) {
      popupRef.current.innerHTML = '';
      return;
    }

    const idx = shapeVariant === -1 ? variantList.length - 1 : shapeVariant;
    const chordData = variantList[idx] || variantList[0];
    const inner = document.createElement('div');
    // Pass capo/tuning so renderChord shows the real transposed name correctly
    renderChord(inner, chordData, {
      capo: effectiveCapo,
      tuning: effectiveTuning,
      titleColor: effectiveChordColor,
    });

    popupRef.current.innerHTML = '';
    popupRef.current.appendChild(inner);
  }, [popup, effectiveCapo, effectiveTuning, effectiveChordColor]);

  return (
    <>
      <div ref={containerRef} />
      {popup && createPortal(
        <div
          ref={popupRef}
          className="lyrics-chord-popup lyrics-chord-popup--visible"
          style={{
            position: 'fixed',
            left: `${popup.x}px`,
            top: `${popup.y}px`,
            transform: 'translate(-50%, -100%)',
            zIndex: 9999,
            pointerEvents: 'none',
          }}
        />,
        document.body
      )}
    </>
  );
}
