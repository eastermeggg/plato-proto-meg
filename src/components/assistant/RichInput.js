import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { createTokenSpan, serializeEditor } from './InlineToken';

// ── RichInput ────────────────────────────────────────────────────────
// Uncontrolled contentEditable input with inline typed tokens. The DOM
// is the source of truth; every mutation re-serializes into a segments
// array handed to the parent via onChange.
//
// Props:
//   disabled, placeholder, variant ('hero'|'standard'),
//   onChange(segments), onTrigger(t|null), onSubmit(),
//   menuOpen, onMenuKey(key), onArrowUpHistory?
//
// Imperative handle: insertToken, insertTriggerChar, clear, focus, isEmpty.

const MENU_KEYS = ['ArrowUp', 'ArrowDown', 'Enter', 'Tab', 'Escape'];
const TRIGGER_RE = /(^|\s)([@/])([^\s@/]*)$/;

const isTokenEl = (el) =>
  !!el && el.nodeType === Node.ELEMENT_NODE && el.hasAttribute && el.hasAttribute('data-token-id');

const RichInput = forwardRef(function RichInput(
  {
    disabled = false,
    placeholder = '',
    placeholderNode = null,
    variant = 'standard',
    onChange,
    onTrigger,
    onSubmit,
    menuOpen = false,
    onMenuKey,
    onArrowUpHistory,
    autoFocus = false,
  },
  ref
) {
  const editorRef = useRef(null);
  const composingRef = useRef(false);
  // Active trigger range: { node (text node), start, end } — internal only.
  const triggerRef = useRef(null);
  const [empty, setEmpty] = useState(true);

  const isEmptySegments = (segments) => {
    const hasToken = segments.some((s) => s.kind === 'token');
    const body = segments
      .filter((s) => s.kind === 'text')
      .map((s) => s.text)
      .join('');
    return !hasToken && body.trim() === '';
  };

  // ── Caret helpers ──────────────────────────────────────────────────

  const getEditorRange = () => {
    const editor = editorRef.current;
    const sel = window.getSelection();
    if (!editor || !sel || sel.rangeCount === 0) return null;
    const range = sel.getRangeAt(0);
    if (!editor.contains(range.startContainer)) return null;
    return range;
  };

  const placeCaretAtEnd = () => {
    const editor = editorRef.current;
    if (!editor) return null;
    const range = document.createRange();
    range.selectNodeContents(editor);
    range.collapse(false);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    return range;
  };

  const getCaretRect = () => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return null;
    const range = sel.getRangeAt(0).cloneRange();
    range.collapse(true);
    const rects = range.getClientRects();
    if (rects.length > 0) return rects[0];
    // Zero-width span fallback (empty lines have no client rect).
    const probe = document.createElement('span');
    probe.appendChild(document.createTextNode('\u200b'));
    range.insertNode(probe);
    const rect = probe.getBoundingClientRect();
    const parent = probe.parentNode;
    parent.removeChild(probe);
    parent.normalize();
    return rect;
  };

  // ── Trigger detection ──────────────────────────────────────────────

  const detectTrigger = () => {
    const range = getEditorRange();
    if (!range || !range.collapsed) return null;
    const node = range.startContainer;
    if (node.nodeType !== Node.TEXT_NODE) return null;
    const upToCaret = (node.nodeValue || '').slice(0, range.startOffset);
    const m = upToCaret.match(TRIGGER_RE);
    if (!m) return null;
    return {
      node,
      start: upToCaret.length - m[2].length - m[3].length,
      end: range.startOffset,
      char: m[2],
      query: m[3],
    };
  };

  const emitTrigger = (segments) => {
    if (!onTrigger) return;
    const t = detectTrigger();
    if (!t) {
      triggerRef.current = null;
      onTrigger(null);
      return;
    }
    triggerRef.current = { node: t.node, start: t.start, end: t.end };
    // inputWasEmpty: the whole editor content minus the trigger text.
    const hasToken = segments.some((s) => s.kind === 'token');
    const body = segments
      .filter((s) => s.kind === 'text')
      .map((s) => s.text)
      .join('');
    const triggerText = (t.node.nodeValue || '').slice(t.start, t.end);
    const remainder = triggerText ? body.replace(triggerText, '') : body;
    const inputWasEmpty = !hasToken && remainder.trim() === '';
    onTrigger({
      char: t.char,
      query: t.query,
      inputWasEmpty,
      caretRect: getCaretRect(),
      replaceRange: { start: t.start, end: t.end },
    });
  };

  // ── Serialization pipeline ─────────────────────────────────────────

  const afterMutation = useCallback(
    (skipTrigger = false) => {
      const editor = editorRef.current;
      if (!editor) return;
      const segments = serializeEditor(editor);
      setEmpty(isEmptySegments(segments));
      if (onChange) onChange(segments);
      if (!skipTrigger && !composingRef.current) emitTrigger(segments);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onChange, onTrigger]
  );

  const handleInput = () => afterMutation();

  // ── Keyboard ───────────────────────────────────────────────────────

  const insertLineBreak = () => {
    let done = false;
    try {
      done = document.execCommand('insertLineBreak');
    } catch (_) {
      done = false;
    }
    if (!done) {
      // Manual BR insertion via Range API (execCommand fallback).
      const range = getEditorRange() || placeCaretAtEnd();
      if (!range) return;
      range.deleteContents();
      const br = document.createElement('br');
      range.insertNode(br);
      if (!br.nextSibling) {
        // A single trailing BR does not render a new line: add a filler.
        br.parentNode.appendChild(document.createElement('br'));
      }
      range.setStartAfter(br);
      range.collapse(true);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      afterMutation();
    }
    // execCommand path fires an input event → handleInput serializes.
  };

  const adjacentToken = (dir) => {
    const range = getEditorRange();
    if (!range || !range.collapsed) return null;
    const node = range.startContainer;
    const off = range.startOffset;
    if (node.nodeType === Node.TEXT_NODE) {
      if (dir === 'before' && off === 0 && isTokenEl(node.previousSibling)) return node.previousSibling;
      if (dir === 'after' && off === (node.nodeValue || '').length && isTokenEl(node.nextSibling)) return node.nextSibling;
      return null;
    }
    if (node.nodeType === Node.ELEMENT_NODE) {
      const child = dir === 'before' ? node.childNodes[off - 1] : node.childNodes[off];
      if (isTokenEl(child)) return child;
    }
    return null;
  };

  const handleKeyDown = (e) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    if (menuOpen && MENU_KEYS.includes(e.key) && !e.shiftKey) {
      e.preventDefault();
      // onMenuKey renvoie false quand le menu n'a rien à activer (aucune ligne).
      // Enter retombe alors sur l'envoi : « /commande » inconnue part en texte brut.
      const handled = onMenuKey ? onMenuKey(e.key) : false;
      if (handled === false && e.key === 'Enter' && !composingRef.current && onSubmit) onSubmit();
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (e.shiftKey) {
        insertLineBreak();
      } else if (!composingRef.current) {
        if (onSubmit) onSubmit();
      }
      return;
    }
    if (e.key === 'ArrowUp' && onArrowUpHistory && empty) {
      e.preventDefault();
      onArrowUpHistory();
      return;
    }
    if (e.key === 'Backspace' || e.key === 'Delete') {
      // Delete a token as one unit (Firefox safety: never enter the span).
      const tokenEl = adjacentToken(e.key === 'Backspace' ? 'before' : 'after');
      if (tokenEl) {
        e.preventDefault();
        tokenEl.remove();
        afterMutation();
      }
    }
  };

  // ── Paste (plain text only) ────────────────────────────────────────

  const handlePaste = (e) => {
    e.preventDefault();
    if (disabled) return;
    const text = e.clipboardData.getData('text/plain');
    if (!text) return;
    const range = getEditorRange() || placeCaretAtEnd();
    if (!range) return;
    range.deleteContents();
    const frag = document.createDocumentFragment();
    let lastNode = null;
    text.split('\n').forEach((line, i) => {
      if (i > 0) {
        lastNode = document.createElement('br');
        frag.appendChild(lastNode);
      }
      if (line) {
        lastNode = document.createTextNode(line);
        frag.appendChild(lastNode);
      }
    });
    if (!lastNode) return;
    range.insertNode(frag);
    range.setStartAfter(lastNode);
    range.collapse(true);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    afterMutation();
  };

  // ── IME composition ────────────────────────────────────────────────

  const handleCompositionStart = () => {
    composingRef.current = true;
  };
  const handleCompositionEnd = () => {
    composingRef.current = false;
    afterMutation();
  };

  // ── Imperative handle ──────────────────────────────────────────────

  useImperativeHandle(ref, () => ({
    insertToken(token) {
      const editor = editorRef.current;
      if (!editor) return;
      editor.focus();
      const sel = window.getSelection();
      let range;
      const t = triggerRef.current;
      if (t && t.node && t.node.isConnected && editor.contains(t.node)) {
        // Replace the trigger text (`@query`) with the token.
        const len = (t.node.nodeValue || '').length;
        range = document.createRange();
        range.setStart(t.node, Math.min(t.start, len));
        range.setEnd(t.node, Math.min(t.end, len));
      } else {
        range = getEditorRange() || placeCaretAtEnd();
      }
      if (!range) return;
      range.deleteContents();
      const span = createTokenSpan(token);
      const space = document.createTextNode(' ');
      range.insertNode(space);
      range.insertNode(span);
      range.setStartAfter(space);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
      triggerRef.current = null;
      afterMutation();
    },
    insertTriggerChar(char) {
      const editor = editorRef.current;
      if (!editor || disabled) return;
      editor.focus();
      const range = getEditorRange() || placeCaretAtEnd();
      if (!range) return;
      range.deleteContents();
      // The trigger regex needs a boundary (^|\s) before the char.
      let prefix = '';
      const node = range.startContainer;
      const off = range.startOffset;
      if (node.nodeType === Node.TEXT_NODE) {
        const before = (node.nodeValue || '')[off - 1];
        if (before && !/\s|\u00a0/.test(before)) prefix = ' ';
      } else if (node.nodeType === Node.ELEMENT_NODE && off > 0) {
        if (isTokenEl(node.childNodes[off - 1])) prefix = ' ';
      }
      const tn = document.createTextNode(prefix + char);
      range.insertNode(tn);
      range.setStart(tn, tn.nodeValue.length);
      range.collapse(true);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      // Natural detection fires from re-serialization.
      afterMutation();
    },
    insertText(text) {
      // Suggestions : place le texte au caret (ou à la fin) et garde le focus.
      const editor = editorRef.current;
      if (!editor || disabled) return;
      editor.focus();
      const range = getEditorRange() || placeCaretAtEnd();
      if (!range) return;
      range.deleteContents();
      const tn = document.createTextNode(text);
      range.insertNode(tn);
      range.setStart(tn, tn.nodeValue.length);
      range.collapse(true);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      triggerRef.current = null;
      afterMutation();
    },
    clearTrigger() {
      const editor = editorRef.current;
      const t = triggerRef.current;
      if (editor && t && t.node && t.node.isConnected && editor.contains(t.node)) {
        const len = (t.node.nodeValue || '').length;
        const range = document.createRange();
        range.setStart(t.node, Math.min(t.start, len));
        range.setEnd(t.node, Math.min(t.end, len));
        range.deleteContents();
      }
      triggerRef.current = null;
      afterMutation(true);
      if (onTrigger) onTrigger(null);
    },
    clear() {
      const editor = editorRef.current;
      if (!editor) return;
      editor.innerHTML = '';
      triggerRef.current = null;
      afterMutation(true);
      if (onTrigger) onTrigger(null);
    },
    focus() {
      editorRef.current?.focus();
    },
    isEmpty() {
      return isEmptySegments(serializeEditor(editorRef.current));
    },
  }));

  useEffect(() => {
    if (autoFocus) editorRef.current?.focus();
  }, [autoFocus]);

  const metrics =
    variant === 'hero'
      ? { minHeight: 72, maxHeight: 240, fontSize: 15, lineHeight: '22px' }
      : { minHeight: 20, maxHeight: 120, fontSize: 14, lineHeight: '20px' };

  return (
    <div className="relative flex-1 min-w-0">
      {empty && (
        <span
          aria-hidden="true"
          className="absolute top-0 left-0 w-full overflow-hidden whitespace-nowrap text-ellipsis pointer-events-none text-foreground-muted"
          style={{ fontSize: metrics.fontSize, lineHeight: metrics.lineHeight }}
        >
          {placeholderNode || placeholder}
        </span>
      )}
      <div
        ref={editorRef}
        role="textbox"
        aria-multiline="true"
        aria-label={placeholder}
        aria-disabled={disabled || undefined}
        contentEditable={!disabled}
        suppressContentEditableWarning
        spellCheck={false}
        className="w-full focus:outline-none whitespace-pre-wrap break-words text-foreground overflow-y-auto"
        style={{
          minHeight: metrics.minHeight,
          maxHeight: metrics.maxHeight,
          fontSize: metrics.fontSize,
          lineHeight: metrics.lineHeight,
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? 'not-allowed' : 'text',
        }}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
      />
    </div>
  );
});

export default RichInput;
