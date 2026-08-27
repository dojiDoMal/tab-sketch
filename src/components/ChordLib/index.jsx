import React, { useRef, useEffect, useState } from 'react';
import { useSectionContext } from '../../contexts/SectionContext.jsx';
import { renderChord } from '../../render.js';
import { chords as allChords } from '../../chords.js';
import './styles.css';

/** MIME type used to identify chord drag payloads from the library. */
export const CHORD_LIB_MIME = 'application/x-tab-sketch-chord';

const PAGE_SIZE = 6;

/**
 * ChordLibItem — renders a single chord diagram from the library.
 * Draggable; sets CHORD_LIB_MIME data on drag so the editor can identify it.
 */
function ChordLibItem({ chord, shapeVariant = 0, capo, tuning, titleColor, onAdd }) {
  const containerRef = useRef(null);
  const section = useSectionContext();

  const effectiveCapo = capo ?? section.capo;
  const effectiveTuning = tuning ?? section.tuning;
  const effectiveTitleColor = titleColor ?? section.chordTitleColor;

  const variants = allChords[chord];
  const variantCount = variants ? variants.length : 0;

  // Normalize the initial variant (supports -1 = last) and keep the currently
  // selected variation in state so the left/right arrows can cycle through shapes.
  const initialVariant = shapeVariant === -1
    ? Math.max(0, variantCount - 1)
    : shapeVariant;
  const [currentVariant, setCurrentVariant] = useState(initialVariant);

  const canPrev = currentVariant > 0;
  const canNext = currentVariant < variantCount - 1;

  // Keep the latest onAdd in a ref so the render effect doesn't depend on it.
  // Consumers commonly pass an inline (non-memoized) callback, which changes
  // identity on every parent render. If onAdd were an effect dependency, each
  // parent re-render would re-run renderChord; and because clicking "+" updates
  // the parent's state, that would cascade into an infinite render loop
  // ("Too many re-renders"). The ref lets us always call the newest onAdd
  // without re-subscribing the effect.
  const onAddRef = useRef(onAdd);
  onAddRef.current = onAdd;

  useEffect(() => {
    if (!containerRef.current || !chord) return;

    if (!variants || variants.length === 0) {
      containerRef.current.innerHTML = `<span style="color: #f66">Chord "${chord}" not found</span>`;
      return;
    }

    const chordData = variants[currentVariant];

    if (!chordData) {
      containerRef.current.innerHTML = `<span style="color: #f66">Variant ${currentVariant} not found for "${chord}"</span>`;
      return;
    }

    const cleanup = renderChord(containerRef.current, chordData, {
      capo: effectiveCapo,
      tuning: effectiveTuning,
      titleColor: effectiveTitleColor,
      // Always route through the ref so we invoke the latest onAdd without
      // making it an effect dependency.
      onAdd: () => onAddRef.current?.({ chord, shapeVariant: currentVariant }),
      onPrev: () => setCurrentVariant((v) => Math.max(0, v - 1)),
      onNext: () => setCurrentVariant((v) => Math.min(variantCount - 1, v + 1)),
      canPrev: currentVariant > 0,
      canNext: currentVariant < variantCount - 1,
    });

    return cleanup;
  }, [chord, currentVariant, variantCount, effectiveCapo, effectiveTuning, effectiveTitleColor]);

  const handleDragStart = (e) => {
    const payload = JSON.stringify({ chord, shapeVariant: currentVariant });
    e.dataTransfer.setData(CHORD_LIB_MIME, payload);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div
      className="chord-lib-item"
      draggable
      onDragStart={handleDragStart}
      title={`Arraste "${chord}" para o editor`}
    >
      <div ref={containerRef} />
    </div>
  );
}

/**
 * ChordLib — a paginated library of all available chords.
 * Displays PAGE_SIZE items (3 columns × 2 rows) at a time, with a "show more" button.
 *
 * Each item is draggable; drop it on the ChordEditor's AddChordButton to add it.
 *
 * @param {object} props
 * @param {string[]} [props.chordNames] - Override which chords to show (defaults to all keys from chords.js)
 * @param {number} [props.capo] - Override capo
 * @param {number} [props.tuning] - Override tuning
 * @param {string} [props.titleColor] - Override chord title color
 */
export function ChordLib({ chordNames, capo, tuning, titleColor, onAdd }) {
  const names = chordNames || Object.keys(allChords);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const visibleChords = names.slice(0, visibleCount);
  const hasMore = visibleCount < names.length;

  const handleShowMore = () => {
    setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, names.length));
  };

  return (
    <div className="chord-lib">
      <div className="chord-lib__grid">
        {visibleChords.map((name) => (
          <ChordLibItem
            key={name}
            chord={name}
            shapeVariant={0}
            capo={capo}
            tuning={tuning}
            titleColor={titleColor}
            onAdd={onAdd}
          />
        ))}
      </div>
      {hasMore && (
        <button
          className="chord-lib__show-more"
          onClick={handleShowMore}
          type="button"
        >
          Mostrar mais ({Math.min(PAGE_SIZE, names.length - visibleCount)})
        </button>
      )}
    </div>
  );
}
