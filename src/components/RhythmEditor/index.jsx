import React, { useState, useRef, useCallback } from 'react';
import { useSectionContext } from '../../contexts/SectionContext.jsx';
import "./styles.css";

const ARROW = '\u279D'; // ➝
const MUTE = '\u2A2F'; // ⨯

/**
 * Stroke type definitions with display content and labels.
 */
const STROKE_CONFIG = {
  D: { label: 'Down', className: 'rhythm-editor-stroke--down' },
  U: { label: 'Up', className: 'rhythm-editor-stroke--up' },
  X: { label: 'Mute', className: 'rhythm-editor-stroke--mute' },
  _: { label: 'Rest', className: 'rhythm-editor-stroke--empty' },
};

/**
 * Parses a pattern string into an array of stroke types.
 */
function parsePattern(patternStr) {
  const normalized = patternStr.toLowerCase();
  return [...normalized].map((ch) => {
    switch (ch) {
      case 'd':
      case 'b':
        return 'D';
      case 'u':
      case 'c':
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
 * Serializes a stroke array back into a pattern string.
 */
function serializePattern(strokes) {
  return strokes.map((s) => {
    switch (s) {
      case 'D': return 'D';
      case 'U': return 'U';
      case 'X': return 'X';
      case '_': return '-';
      default: return '-';
    }
  }).join('');
}

/**
 * Creates a fixed-length array of rests based on time signature.
 * For [4,4] with 4 subdivisions per beat → 16 slots.
 */
function createEmptyPattern(timeSignature, subdivisionsPerBeat = 4) {
  const [beats] = timeSignature;
  const totalSlots = beats * subdivisionsPerBeat;
  return Array(totalSlots).fill('_');
}

/**
 * Renders the visual content for a single stroke.
 */
function StrokeContent({ type }) {
  switch (type) {
    case 'D':
      return <span className="rhythm-editor-stroke-arrow rhythm-editor-stroke--down">{ARROW}</span>;
    case 'U':
      return <span className="rhythm-editor-stroke-arrow rhythm-editor-stroke--up">{ARROW}</span>;
    case 'X':
      return (
        <span className="rhythm-editor-stroke-mute">
          <span>{MUTE}</span>
          <span>{MUTE}</span>
        </span>
      );
    case '_':
    default:
      return <span className="rhythm-editor-stroke-rest">-</span>;
  }
}

/**
 * Beat counter row — mirrors the RhythmDisplay counter.
 */
function BeatCounter({ beats, subdivisionsPerBeat }) {
  const items = [];
  for (let beat = 1; beat <= beats; beat++) {
    items.push(
      <span key={`beat-${beat}`} className="rhythm-editor-beat-number">{beat}</span>
    );
    for (let sub = 1; sub < subdivisionsPerBeat; sub++) {
      items.push(
        <span key={`sub-${beat}-${sub}`} className="rhythm-editor-beat-subdivider">-</span>
      );
    }
  }
  return <div className="rhythm-editor-counter">{items}</div>;
}

/**
 * Palette items — draggable source elements for replacing strokes in the pattern.
 */
const PALETTE_ITEMS = [
  { id: 'down', type: 'D', label: 'Down' },
  { id: 'up', type: 'U', label: 'Up' },
  { id: 'mute', type: 'X', label: 'Mute' },
  { id: 'rest', type: '_', label: 'Rest' },
];

/**
 * StrokePalette — row of draggable source elements.
 * Dragging one of these onto the pattern replaces the target slot.
 */
function StrokePalette({ onDragStart, onDragEnd }) {
  return (
    <div className="rhythm-editor-palette">
      {PALETTE_ITEMS.map((item) => (
        <div
          key={item.id}
          draggable
          onDragStart={(e) => {
            e.dataTransfer.setData('application/rhythm-stroke', item.type);
            e.dataTransfer.setData('source', 'palette');
            onDragStart(item.type);
          }}
          onDragEnd={onDragEnd}
          className="rhythm-editor-palette-item"
          title={item.label}
        >
          <StrokeContent type={item.type} />
        </div>
      ))}
    </div>
  );
}

/**
 * RhythmEditor component — editable rhythm pattern with fixed-length grid.
 *
 * The time signature determines the total number of slots. Strokes from the
 * palette are dragged onto slots to replace them. Dragging between slots swaps
 * their values. Dropping on the remove zone (or dragging rest onto a slot)
 * resets that slot to rest.
 *
 * @param {object} props
 * @param {string} [props.pattern] - Optional initial pattern string to pre-populate
 * @param {[number, number]} [props.timeSignature=[4,4]] - Time signature (defines grid length)
 * @param {number} [props.subdivisionsPerBeat=4] - Subdivisions per beat
 * @param {number} [props.bpm] - Override bpm from Section context
 * @param {boolean} [props.showBpmLabel=true] - Whether to display the BPM label
 * @param {boolean} [props.showPalette=true] - Whether to show the stroke palette
 * @param {function} [props.onPatternChange] - Callback fired with the new pattern string after edit
 */
export function RhythmEditor({
  pattern,
  timeSignature = [4, 4],
  subdivisionsPerBeat = 4,
  bpm,
  showBpmLabel = true,
  showPalette = true,
  onPatternChange,
}) {
  const section = useSectionContext();
  const effectiveBpm = bpm ?? section.bpm;

  const [beats] = timeSignature;
  const totalSlots = beats * subdivisionsPerBeat;

  // Initialize strokes: use pattern if provided (truncate/pad to fit), otherwise all rests
  const [strokes, setStrokes] = useState(() => {
    if (pattern) {
      const parsed = parsePattern(pattern);
      // Pad or truncate to match the fixed grid size
      if (parsed.length >= totalSlots) {
        return parsed.slice(0, totalSlots);
      }
      return [...parsed, ...Array(totalSlots - parsed.length).fill('_')];
    }
    return createEmptyPattern(timeSignature, subdivisionsPerBeat);
  });

  const [dragIndex, setDragIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [paletteStroke, setPaletteStroke] = useState(null);

  const dragItem = useRef(null);

  // Sync external pattern changes
  const prevPatternRef = useRef(pattern);
  if (pattern !== prevPatternRef.current) {
    prevPatternRef.current = pattern;
    if (pattern) {
      const parsed = parsePattern(pattern);
      if (parsed.length >= totalSlots) {
        setStrokes(parsed.slice(0, totalSlots));
      } else {
        setStrokes([...parsed, ...Array(totalSlots - parsed.length).fill('_')]);
      }
    } else {
      setStrokes(createEmptyPattern(timeSignature, subdivisionsPerBeat));
    }
  }

  // --- Helper to commit a new strokes array ---
  const commitStrokes = useCallback((newStrokes) => {
    setStrokes(newStrokes);
    if (onPatternChange) {
      onPatternChange(serializePattern(newStrokes));
    }
  }, [onPatternChange]);

  // --- Pattern slot drag handlers (swap between slots) ---
  const handleDragStart = useCallback((index) => {
    dragItem.current = index;
    setDragIndex(index);
  }, []);

  const handleDragEnter = useCallback((index) => {
    setDragOverIndex(index);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDragIndex(null);
    setDragOverIndex(null);
    dragItem.current = null;
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  // --- Drop on a pattern slot ---
  const handleDropOnSlot = useCallback((index) => {
    const items = [...strokes];

    if (paletteStroke !== null) {
      // Palette drop → replace the target slot
      items[index] = paletteStroke;
      commitStrokes(items);
      setPaletteStroke(null);
    } else if (dragItem.current !== null && dragItem.current !== index) {
      // Slot-to-slot drag → swap
      const temp = items[index];
      items[index] = items[dragItem.current];
      items[dragItem.current] = temp;
      commitStrokes(items);
    }

    setDragIndex(null);
    setDragOverIndex(null);
    dragItem.current = null;
  }, [strokes, paletteStroke, commitStrokes]);

  // --- Remove zone: resets the dragged slot to rest ---
  const [removeHover, setRemoveHover] = useState(false);

  const handleRemoveDragOver = useCallback((e) => {
    e.preventDefault();
    setRemoveHover(true);
  }, []);

  const handleRemoveDragLeave = useCallback(() => {
    setRemoveHover(false);
  }, []);

  const handleRemoveDrop = useCallback(() => {
    if (dragItem.current === null) {
      setRemoveHover(false);
      return;
    }

    const items = [...strokes];
    items[dragItem.current] = '_'; // Reset to rest
    commitStrokes(items);

    setDragIndex(null);
    setDragOverIndex(null);
    setRemoveHover(false);
    dragItem.current = null;
  }, [strokes, commitStrokes]);

  // --- Palette drag handlers ---
  const handlePaletteDragStart = useCallback((strokeType) => {
    setPaletteStroke(strokeType);
  }, []);

  const handlePaletteDragEnd = useCallback(() => {
    setPaletteStroke(null);
    setDragOverIndex(null);
  }, []);

  return (
    <div className="rhythm-editor">
      {showBpmLabel && effectiveBpm && (
        <div className="rhythm-editor-bpm">
          <span>{effectiveBpm} bpm</span>
        </div>
      )}

      {showPalette && (
        <StrokePalette
          onDragStart={handlePaletteDragStart}
          onDragEnd={handlePaletteDragEnd}
        />
      )}

      <div className="rhythm-editor-pattern">
        {strokes.map((stroke, index) => (
          <div
            key={index}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragEnter={() => handleDragEnter(index)}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDrop={() => handleDropOnSlot(index)}
            className={[
              'rhythm-editor-stroke',
              dragIndex === index ? 'rhythm-editor-stroke--dragging' : '',
              dragOverIndex === index ? 'rhythm-editor-stroke--drag-over' : '',
            ].filter(Boolean).join(' ')}
            title={STROKE_CONFIG[stroke]?.label || 'Rest'}
          >
            <StrokeContent type={stroke} />
          </div>
        ))}
      </div>

      <BeatCounter beats={beats} subdivisionsPerBeat={subdivisionsPerBeat} />

      {dragIndex !== null && (
        <div
          className={[
            'rhythm-editor-remove-zone',
            removeHover ? 'rhythm-editor-remove-zone--hover' : '',
          ].filter(Boolean).join(' ')}
          onDragOver={handleRemoveDragOver}
          onDragLeave={handleRemoveDragLeave}
          onDrop={handleRemoveDrop}
        >
          Remover
        </div>
      )}
    </div>
  );
}
