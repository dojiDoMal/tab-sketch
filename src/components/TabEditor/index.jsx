import React, { useState, useRef, useCallback, useImperativeHandle, forwardRef } from 'react';
import { TabDisplay } from '../TabDisplay/index.jsx';
import "./styles.css";

/** Blank 6-string tab template used when no initial tab is provided. */
const EMPTY_TAB = [
  'e|-------------------------|',
  'B|-------------------------|',
  'G|-------------------------|',
  'D|-------------------------|',
  'A|-------------------------|',
  'E|-------------------------|',
].join('\n');

/**
 * A line counts as a tab line when it has the "X|..." shape (label + bar) or is
 * clearly part of a staff (contains dashes/bars). Column operations only touch
 * these lines so labels/blank lines are left alone.
 */
function isTabLine(line) {
  return /^\s*[a-gA-G#b]{1,3}\s*\|/.test(line) || /^[-|]/.test(line.trimStart()) || /[-|]/.test(line);
}

/**
 * Returns the character index where the editable body starts on a line — i.e.
 * just after the "X|" prefix. Columns are counted from this offset so the
 * label and the opening bar are never modified.
 */
function bodyStart(line) {
  const m = line.match(/^\s*[a-gA-G#b]{1,3}\s*\|/);
  if (m) return m[0].length;
  // No label prefix; if it opens with a bare "|", protect that too.
  if (line.startsWith('|')) return 1;
  return 0;
}

/**
 * Applies a single-column insert/remove across every tab line of the text,
 * keeping all strings aligned.
 *
 * @param {string} text - full textarea value
 * @param {number} caret - linear caret position (selectionStart)
 * @param {'insert'|'remove'} op
 * @param {'before'|'after'} side - relative to the caret column
 * @returns {{ text: string, caret: number }} new text and adjusted caret
 */
function applyColumnOp(text, caret, op, side) {
  const lines = text.split('\n');

  // Locate the caret's line and its column within that line.
  let acc = 0;
  let caretLine = 0;
  let caretCol = 0;
  for (let i = 0; i < lines.length; i++) {
    const lineLen = lines[i].length;
    if (caret <= acc + lineLen) {
      caretLine = i;
      caretCol = caret - acc;
      break;
    }
    acc += lineLen + 1; // +1 for the newline
    caretLine = i;
    caretCol = lineLen;
  }

  const refLine = lines[caretLine] ?? '';
  const start = bodyStart(refLine);
  // Column within the body. The caret sits BETWEEN characters: bodyCol=0 is
  // before the first body char, bodyCol=k is between char k-1 and char k.
  const bodyCol = Math.max(0, caretCol - start);

  // The body index to insert at / remove.
  //   insert before/after → insert a dash at column `bodyCol`
  //   remove before       → delete the char at `bodyCol - 1` (left of caret)
  //   remove after        → delete the char at `bodyCol`     (right of caret)
  const removeIdx = side === 'before' ? bodyCol - 1 : bodyCol;

  const newLines = lines.map((line) => {
    if (!isTabLine(line)) return line;
    const s = bodyStart(line);
    const head = line.slice(0, s);
    const body = line.slice(s);

    if (op === 'insert') {
      const at = Math.max(0, Math.min(bodyCol, body.length));
      return head + body.slice(0, at) + '-' + body.slice(at);
    }
    // remove
    if (removeIdx < 0 || removeIdx >= body.length) return line; // nothing to remove
    return head + body.slice(0, removeIdx) + body.slice(removeIdx + 1);
  });

  // Every tab line changes length by ±1, so the linear caret shifts by the
  // number of edited lines ABOVE the caret's line, plus the effect on the
  // caret's own line.
  const delta = op === 'insert' ? 1 : -1;

  // Count edited (tab) lines strictly above the caret line — each shifts the
  // caret's linear position by `delta`.
  let editedAbove = 0;
  for (let i = 0; i < caretLine; i++) {
    if (isTabLine(lines[i]) && (op === 'insert' || removeIdx < lines[i].slice(bodyStart(lines[i])).length && removeIdx >= 0)) {
      editedAbove += 1;
    }
  }

  // Effect on the caret's own line.
  let sameLine = 0;
  const refIsTab = isTabLine(refLine);
  if (refIsTab) {
    if (op === 'insert') {
      // Dash inserted at bodyCol: it lands left of the caret only for "before".
      sameLine = side === 'before' ? 1 : 0;
    } else {
      const canRemove = removeIdx >= 0 && removeIdx < refLine.slice(start).length;
      // Removed char is left of the caret only for "before".
      sameLine = canRemove && side === 'before' ? -1 : 0;
    }
  }

  let newCaret = caret + editedAbove * delta + sameLine;
  if (newCaret < 0) newCaret = 0;

  return { text: newLines.join('\n'), caret: newCaret };
}

/**
 * Inserts spaces at the caret when the user presses Tab, so the key doesn't move
 * focus out of the textarea (a common annoyance when typing tablature).
 */
function handleTabKey(e, value, setValue) {
  if (e.key !== 'Tab') return false;
  e.preventDefault();
  const el = e.target;
  const start = el.selectionStart;
  const end = el.selectionEnd;
  const next = value.slice(0, start) + '  ' + value.slice(end);
  setValue(next);
  // Restore caret after the inserted spaces on the next tick.
  requestAnimationFrame(() => {
    el.selectionStart = el.selectionEnd = start + 2;
  });
  return true;
}

/** Maximum number of states kept in the undo/redo history. */
const HISTORY_LIMIT = 128;

/**
 * TabEditor — editable guitar tablature.
 *
 * A monospaced textarea holds the raw ASCII tab; a live TabDisplay preview shows
 * how it renders with intelligent wrapping. This keeps full fidelity with the
 * ubiquitous ASCII tab format while giving immediate visual feedback.
 *
 * Edits are recorded in a bounded undo/redo history (up to {@link HISTORY_LIMIT}
 * states). Undo/redo is available via Ctrl/Cmd+Z and Ctrl/Cmd+Shift+Z (or
 * Ctrl+Y) and through the imperative undo()/redo() methods.
 *
 * @param {object} props
 * @param {string} [props.tab] - Initial tab text (defaults to a blank 6-string template)
 * @param {boolean} [props.showPreview=true] - Whether to render the live preview
 * @param {number} [props.rows=6] - Textarea height in rows
 * @param {function} [props.onTabChange] - Callback fired with the new tab string after edit
 * @param {function} [props.onChange] - Alias for onTabChange
 * @param {React.Ref} ref - Imperative API:
 *   clear() / setTab(str) / getTab()
 *   undo() / redo() / canUndo() / canRedo()     — traverse the edit history
 *   addColumnBefore() / addColumnAfter()       — insert a '-' column at the caret
 *   removeColumnBefore() / removeColumnAfter()  — delete a column at the caret
 *   Column operations act on every string line at once, using the textarea
 *   caret to decide which column, so the six strings stay aligned.
 */
export const TabEditor = forwardRef(function TabEditor({
  tab,
  showPreview = true,
  rows = 6,
  onTabChange,
  onChange,
}, ref) {
  // Undo/redo history: `stack` holds successive tab strings, `index` points at
  // the current one. Anything after `index` is the redo tail.
  const initial = tab ?? EMPTY_TAB;
  const [history, setHistory] = useState({ stack: [initial], index: 0 });
  const value = history.stack[history.index];
  const textareaRef = useRef(null);

  const canUndo = history.index > 0;
  const canRedo = history.index < history.stack.length - 1;

  // Sync external tab changes: replace the whole history with the new baseline.
  const prevTabRef = useRef(tab);
  if (tab !== prevTabRef.current) {
    prevTabRef.current = tab;
    const next = tab ?? EMPTY_TAB;
    // Only reset if it actually differs from the current value, so an external
    // re-render with the same prop doesn't wipe the user's history.
    if (next !== history.stack[history.index]) {
      setHistory({ stack: [next], index: 0 });
    }
  }

  const notify = useCallback((next) => {
    if (onTabChange) onTabChange(next);
    if (onChange) onChange(next);
  }, [onTabChange, onChange]);

  /**
   * Pushes a new value onto the history, dropping the redo tail and trimming the
   * oldest entries once the limit is exceeded.
   */
  const commit = useCallback((next) => {
    setHistory((h) => {
      if (next === h.stack[h.index]) return h; // no-op edit
      // Drop redo tail, then append.
      let stack = h.stack.slice(0, h.index + 1);
      stack.push(next);
      // Trim from the front if over the limit.
      if (stack.length > HISTORY_LIMIT) {
        stack = stack.slice(stack.length - HISTORY_LIMIT);
      }
      return { stack, index: stack.length - 1 };
    });
    notify(next);
  }, [notify]);

  const handleInput = useCallback((e) => {
    commit(e.target.value);
  }, [commit]);

  /** Moves one step back in history, notifying listeners of the restored value. */
  const undo = useCallback(() => {
    let restored = null;
    setHistory((h) => {
      if (h.index <= 0) return h;
      restored = h.stack[h.index - 1];
      return { stack: h.stack, index: h.index - 1 };
    });
    if (restored !== null) notify(restored);
    return restored;
  }, [notify]);

  /** Moves one step forward in history, notifying listeners of the restored value. */
  const redo = useCallback(() => {
    let restored = null;
    setHistory((h) => {
      if (h.index >= h.stack.length - 1) return h;
      restored = h.stack[h.index + 1];
      return { stack: h.stack, index: h.index + 1 };
    });
    if (restored !== null) notify(restored);
    return restored;
  }, [notify]);

  const handleKeyDown = useCallback((e) => {
    if (handleTabKey(e, value, commit)) return;
    // Undo/redo shortcuts. Let the browser's native textarea undo be replaced
    // by our history so it stays in sync with programmatic edits.
    const mod = e.ctrlKey || e.metaKey;
    if (mod && (e.key === 'z' || e.key === 'Z')) {
      e.preventDefault();
      if (e.shiftKey) redo();
      else undo();
      return;
    }
    if (mod && (e.key === 'y' || e.key === 'Y')) {
      e.preventDefault();
      redo();
    }
  }, [value, commit, undo, redo]);

  /**
   * Runs a column operation at the current caret, commits the new text, and
   * restores the caret. Keeps focus in the textarea so the user can chain edits.
   */
  const runColumnOp = useCallback((op, side) => {
    const el = textareaRef.current;
    const caret = el ? el.selectionStart : value.length;
    const { text: next, caret: newCaret } = applyColumnOp(value, caret, op, side);
    commit(next);
    requestAnimationFrame(() => {
      if (el) {
        el.focus();
        el.selectionStart = el.selectionEnd = newCaret;
      }
    });
    return next;
  }, [value, commit]);

  useImperativeHandle(ref, () => ({
    /** Resets the tab to the blank 6-string template. */
    clear() {
      commit(EMPTY_TAB);
    },
    /** Replaces the current tab with the given string. */
    setTab(nextTab) {
      commit(nextTab ?? EMPTY_TAB);
    },
    /** Returns the current tab string. */
    getTab() {
      return value;
    },
    /** Steps back to the previous state in the edit history, if any. */
    undo() {
      return undo();
    },
    /** Steps forward to the next state in the edit history, if any. */
    redo() {
      return redo();
    },
    /** Whether there is a previous state to undo to. */
    canUndo() {
      return canUndo;
    },
    /** Whether there is a next state to redo to. */
    canRedo() {
      return canRedo;
    },
    /** Inserts a '-' column immediately before the caret column, across all strings. */
    addColumnBefore() {
      return runColumnOp('insert', 'before');
    },
    /** Inserts a '-' column immediately after the caret column, across all strings. */
    addColumnAfter() {
      return runColumnOp('insert', 'after');
    },
    /** Removes the column immediately before the caret, across all strings. */
    removeColumnBefore() {
      return runColumnOp('remove', 'before');
    },
    /** Removes the column immediately after the caret, across all strings. */
    removeColumnAfter() {
      return runColumnOp('remove', 'after');
    },
  }), [commit, value, runColumnOp, undo, redo, canUndo, canRedo]);

  return (
    <div className="tab-editor">
      <div className="tab-editor-input-wrap">
        <textarea
          ref={textareaRef}
          className="tab-editor-input"
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          rows={rows}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          wrap="off"
          aria-label="Editor de tablatura"
        />
      </div>

      {showPreview && (
        <div className="tab-editor-preview">
          <span className="tab-editor-preview-label">Preview</span>
          <TabDisplay tab={value} />
        </div>
      )}
    </div>
  );
});
