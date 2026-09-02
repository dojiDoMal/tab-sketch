import React, { useRef, useEffect, useState, useLayoutEffect } from 'react';
import { renderTab, parseTab } from '../../tab.js';
import "./styles.css";

/**
 * Measures the pixel width of a single monospaced character for the given
 * element's computed font, using a hidden off-DOM canvas. Falls back to a
 * reasonable estimate if measurement isn't possible.
 *
 * @param {HTMLElement} el
 * @returns {number} width in pixels of one character
 */
function measureCharWidth(el) {
  const style = window.getComputedStyle(el);
  const font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
  const canvas = measureCharWidth._canvas || (measureCharWidth._canvas = document.createElement('canvas'));
  const ctx = canvas.getContext('2d');
  ctx.font = font;
  // Use a wide-ish reference char; monospaced fonts render all glyphs equally.
  const w = ctx.measureText('0').width;
  return w > 0 ? w : parseFloat(style.fontSize) * 0.6 || 8;
}

/**
 * TabDisplay — renders guitar tablature with intelligent line wrapping.
 *
 * The tab is parsed once, then the component measures the available width and
 * the monospaced character width to compute how many columns fit per line. It
 * re-wraps automatically whenever the container resizes (ResizeObserver), so
 * the tab always respects the screen/window width without a horizontal
 * scrollbar.
 *
 * Tab can be passed either as the `tab` prop or as children (string).
 *
 * @param {object} props
 * @param {string} [props.tab] - ASCII tablature text
 * @param {boolean} [props.wrap=true] - When false, disables wrapping (single long staff)
 * @param {number} [props.minCols=8] - Minimum columns per line before giving up on wrapping
 * @param {React.ReactNode} [props.children] - Alternative way to pass the tab text
 */
export function TabDisplay({ tab, wrap = true, minCols = 8, children }) {
  const containerRef = useRef(null);
  const measureRef = useRef(null);
  const [colsPerLine, setColsPerLine] = useState(0);

  const text = tab ?? (typeof children === 'string' ? children : String(children || ''));

  // Parse once per text change; the model is what we re-wrap on resize.
  const model = React.useMemo(() => parseTab(text), [text]);

  // Total display width (in chars) reserved by the string label + open-string bar.
  // "e" + "|" => 2 columns of fixed lead we must subtract from the budget.
  const LEAD_CHARS = 2;

  const recompute = React.useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    if (!wrap) {
      setColsPerLine(0);
      return;
    }

    const charWidth = measureCharWidth(measureRef.current || container);
    if (charWidth <= 0) return;

    // Measure the real content width, subtracting the container's horizontal
    // padding. clientWidth includes padding, so a padded preview box would
    // otherwise overreport the usable space by the padding amount.
    const style = window.getComputedStyle(container);
    const padX = (parseFloat(style.paddingLeft) || 0) + (parseFloat(style.paddingRight) || 0);
    const available = container.clientWidth - padX;
    if (available <= 0) return;

    // How many single-char columns fit, minus the fixed lead (label + open bar)
    // and a 1-column safety margin. The margin absorbs subpixel drift between
    // the canvas-measured char width and the CSS `1ch` cell width, which would
    // otherwise accumulate across the row and push the last dash past the edge.
    const fit = Math.floor(available / charWidth) - LEAD_CHARS - 1;
    const cols = Math.max(minCols, fit);
    setColsPerLine(cols);
  }, [wrap, minCols]);

  // Recompute on mount and whenever the container resizes.
  useLayoutEffect(() => {
    recompute();
    const container = containerRef.current;
    if (!container || typeof ResizeObserver === 'undefined') return;

    const ro = new ResizeObserver(() => recompute());
    ro.observe(container);
    return () => ro.disconnect();
  }, [recompute]);

  // Render whenever the model or the computed columns change.
  useEffect(() => {
    if (!containerRef.current) return;
    renderTab(containerRef.current, model, { colsPerLine: wrap ? colsPerLine : 0 });
  }, [model, colsPerLine, wrap]);

  return (
    <div className="tab-display">
      {/* Hidden probe used only to measure the monospaced char width. */}
      <span ref={measureRef} className="tab-line" aria-hidden="true" style={{ position: 'absolute', visibility: 'hidden', pointerEvents: 'none' }}>0</span>
      <div ref={containerRef} className="tab-display-canvas" />
    </div>
  );
}
