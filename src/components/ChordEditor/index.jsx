import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from 'react';
import { useSectionContext } from '../../contexts/SectionContext.jsx';
import { renderChord } from '../../render.js';
import { chords } from '../../chords.js';
import { CHORD_LIB_MIME } from '../ChordLib/index.jsx';
import "./styles.css"

const GRABBER = '\u283F'; // ⠿ (braille pattern dots-123456), rotated 90deg via CSS

let chordUid = 0;
const nextUid = () => `chord-${++chordUid}`;

/**
 * Normalizes a chord entry into { id, chord, shapeVariant }.
 * Accepts either a plain string ("Am") or an object ({ chord, shapeVariant }).
 */
function normalizeChord(entry) {
  if (typeof entry === 'string') {
    return { id: nextUid(), chord: entry, shapeVariant: 0 };
  }
  return {
    id: entry.id ?? nextUid(),
    chord: entry.chord,
    shapeVariant: entry.shapeVariant ?? 0,
  };
}

/**
 * AddChordButton — the "add chord" affordance shown to the right of the last chord,
 * or by itself when there are no chords yet.
 * Also acts as a drop target for chords dragged from ChordLib.
 *
 * @param {object} props
 * @param {() => void} [props.onClick] - Called when the button is clicked.
 * @param {(entry: {chord: string, shapeVariant: number}) => void} [props.onDropChord] - Called when a chord is dropped from the library.
 */
export function AddChordButton({ onClick, onDropChord }) {
  const [dragOver, setDragOver] = useState(false);

  const handleDragOver = (e) => {
    if (e.dataTransfer.types.includes(CHORD_LIB_MIME)) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    }
  };

  const handleDragEnter = (e) => {
    if (e.dataTransfer.types.includes(CHORD_LIB_MIME)) {
      setDragOver(true);
    }
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const raw = e.dataTransfer.getData(CHORD_LIB_MIME);
    if (!raw) return;
    try {
      const payload = JSON.parse(raw);
      onDropChord?.(payload);
    } catch { /* ignore malformed payload */ }
  };

  const className = [
    'tab-sketch-wrapper add-chord',
    dragOver ? 'add-chord--drag-over' : '',
  ].filter(Boolean).join(' ');

  return (
    <div
      className={className}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="tab-sketch-container add-chord__container">
        <div className="tab-sketch add-chord__content">
          <span className="add-chord__hint">Solte o acorde aqui</span>
          <span className="add-chord__icon">+</span>
        </div>
      </div>
    </div>
  );
}

/**
 * ChordEditorItem — renders a single chord diagram (via the renderChord engine)
 * with a grabber handle beneath it used to drag-reorder the chord.
 *
 * @param {object} props
 * @param {string} props.chord - Chord name (e.g. 'Am', 'G', 'D#9')
 * @param {number} [props.shapeVariant=0] - Which shape variant to render (-1 for last)
 * @param {number} [props.capo] - Override capo from Section context
 * @param {number} [props.tuning] - Override tuning from Section context
 * @param {string} [props.titleColor] - Override chordTitleColor from Section context
 * @param {boolean} [props.dragging] - Whether this item is currently being dragged
 * @param {boolean} [props.dragOver] - Whether a dragged item is hovering over this one
 * @param {object} [props.dragHandlers] - Grabber pointer/drag handlers for reordering
 */
export function ChordEditorItem({
  chord,
  shapeVariant = 0,
  capo,
  tuning,
  titleColor,
  dragging = false,
  dragOver = false,
  dragHandlers = {},
}) {
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

  const className = [
    'chord-editor-item',
    dragging ? 'chord-editor-item--dragging' : '',
    dragOver ? 'chord-editor-item--drag-over' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={className} {...dragHandlers.item}>
      <div ref={containerRef} />
      <div
        className="chord-editor__grabber"
        title="Arraste para reordenar"
        {...dragHandlers.handle}
      >
        <span className="chord-editor__grabber-icon">{GRABBER}</span>
      </div>
    </div>
  );
}

/**
 * ChordEditor component — an editable, reorderable list of chord diagrams.
 *
 * The list of chords lives inside the component. Each chord has a grabber handle;
 * click and hold it to drag-reorder the chord. An "add chord" button is shown to the
 * right of the last chord (or by itself when the list is empty).
 *
 * The current list can be read via the `onChange` callback or the imperative ref API
 * (`getChords`, `setChords`, `addChord`, `clear`), mirroring RhythmEditor.
 *
 * @param {object} props
 * @param {Array<string|{chord: string, shapeVariant?: number}>} [props.chords] - Initial chord list
 * @param {number} [props.capo] - Override capo from Section context
 * @param {number} [props.tuning] - Override tuning from Section context
 * @param {string} [props.titleColor] - Override chordTitleColor from Section context
 * @param {(chords: Array<{chord: string, shapeVariant: number}>) => void} [props.onChange] - Fired with the new list after any edit
 * @param {() => (string|{chord: string, shapeVariant?: number})} [props.onAddChord] - Returns the chord to append when the add button is clicked
 * @param {React.Ref} ref - Exposes getChords/setChords/addChord/clear
 */
export const ChordEditor = forwardRef(function ChordEditor({
  chords: initialChords = [],
  capo,
  tuning,
  titleColor,
  onChange,
  onAddChord,
}, ref) {
  const [items, setItems] = useState(() => initialChords.map(normalizeChord));

  // Sync external chords prop changes.
  //
  // We compare by *content*, not by reference: consumers commonly pass an inline
  // array literal (`chords={[...]}`), which is a brand-new reference on every
  // render. A reference check would then setState during every render and cause
  // an infinite render loop ("Too many re-renders"). Serializing the chord/
  // shapeVariant of each entry gives us a stable signature to diff against.
  const chordsSignature = JSON.stringify(
    initialChords.map((entry) =>
      typeof entry === 'string'
        ? { chord: entry, shapeVariant: 0 }
        : { chord: entry.chord, shapeVariant: entry.shapeVariant ?? 0 }
    )
  );
  const prevChordsSigRef = useRef(chordsSignature);
  if (chordsSignature !== prevChordsSigRef.current) {
    prevChordsSigRef.current = chordsSignature;
    setItems(initialChords.map(normalizeChord));
  }

  const [dragId, setDragId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);
  const [removeHover, setRemoveHover] = useState(false);
  const dragHandleActive = useRef(false);

  const commit = useCallback((next) => {
    setItems(next);
    if (onChange) {
      onChange(next.map(({ chord, shapeVariant }) => ({ chord, shapeVariant })));
    }
  }, [onChange]);

  // --- Imperative handle (mirrors RhythmEditor) ---
  useImperativeHandle(ref, () => ({
    /** Returns the current chord list as plain { chord, shapeVariant } objects. */
    getChords() {
      return items.map(({ chord, shapeVariant }) => ({ chord, shapeVariant }));
    },
    /** Replaces the whole list. */
    setChords(next) {
      commit((next || []).map(normalizeChord));
    },
    /** Appends a chord to the end of the list. */
    addChord(entry) {
      commit([...items, normalizeChord(entry)]);
    },
    /** Empties the list. */
    clear() {
      commit([]);
    },
  }), [items, commit]);

  // --- Reorder drag handlers ---
  // Drag is only allowed to start from the grabber handle (pointer-down on it
  // flips the flag; the item's dragstart bails out otherwise).
  const handleGrabberPointerDown = useCallback(() => {
    dragHandleActive.current = true;
  }, []);

  const handleItemDragStart = useCallback((id) => (e) => {
    if (!dragHandleActive.current) {
      e.preventDefault();
      return;
    }
    setDragId(id);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleItemDragEnter = useCallback((id) => () => {
    setDragOverId(id);
  }, []);

  const handleItemDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleItemDrop = useCallback((targetId) => (e) => {
    e.preventDefault();
    if (dragId === null || dragId === targetId) {
      setDragId(null);
      setDragOverId(null);
      dragHandleActive.current = false;
      return;
    }

    const fromIndex = items.findIndex((it) => it.id === dragId);
    const toIndex = items.findIndex((it) => it.id === targetId);
    if (fromIndex === -1 || toIndex === -1) return;

    const next = [...items];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    commit(next);

    setDragId(null);
    setDragOverId(null);
    dragHandleActive.current = false;
  }, [dragId, items, commit]);

  const handleItemDragEnd = useCallback(() => {
    setDragId(null);
    setDragOverId(null);
    dragHandleActive.current = false;
  }, []);

  // --- Add button ---
  const handleAdd = useCallback(() => {
    const entry = onAddChord ? onAddChord() : undefined;
    if (entry == null) return;
    commit([...items, normalizeChord(entry)]);
  }, [onAddChord, items, commit]);

  // --- Drop from ChordLib ---
  const handleDropChord = useCallback((entry) => {
    if (!entry || !entry.chord) return;
    commit([...items, normalizeChord(entry)]);
  }, [items, commit]);

  // --- Remove zone ---
  const handleRemoveDragOver = useCallback((e) => {
    e.preventDefault();
    setRemoveHover(true);
  }, []);

  const handleRemoveDragLeave = useCallback(() => {
    setRemoveHover(false);
  }, []);

  const handleRemoveDrop = useCallback(() => {
    if (dragId === null) {
      setRemoveHover(false);
      return;
    }

    const next = items.filter((it) => it.id !== dragId);
    commit(next);

    setDragId(null);
    setDragOverId(null);
    setRemoveHover(false);
    dragHandleActive.current = false;
  }, [dragId, items, commit]);

  return (
    <div className="chord-editor">
      <div className="chord-editor-list">
        {items.map((item) => (
          <ChordEditorItem
            key={item.id}
            chord={item.chord}
            shapeVariant={item.shapeVariant}
            capo={capo}
            tuning={tuning}
            titleColor={titleColor}
            dragging={dragId === item.id}
            dragOver={dragOverId === item.id && dragId !== item.id}
            dragHandlers={{
              item: {
                draggable: true,
                onDragStart: handleItemDragStart(item.id),
                onDragEnter: handleItemDragEnter(item.id),
                onDragOver: handleItemDragOver,
                onDrop: handleItemDrop(item.id),
                onDragEnd: handleItemDragEnd,
              },
              handle: {
                onPointerDown: handleGrabberPointerDown,
              },
            }}
          />
        ))}
        <AddChordButton onClick={handleAdd} onDropChord={handleDropChord} />
      </div>

      {dragId !== null && (
        <div
          className={[
            'chord-editor-remove-zone',
            removeHover ? 'chord-editor-remove-zone--hover' : '',
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
});
