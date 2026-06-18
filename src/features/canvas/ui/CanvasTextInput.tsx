import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { TextBackgroundMode, TextInputState, TextStyle } from '../model/types';

interface CanvasTextInputProps {
  textInput: TextInputState;
  primaryColor: string;
  backgroundMode: TextBackgroundMode;
  backgroundColor: string;
  textStyle: TextStyle;
  onChange: (textInput: TextInputState) => void;
  onCancel: () => void;
  onCommit: () => void;
}

export default function CanvasTextInput({
  textInput,
  primaryColor,
  backgroundMode,
  backgroundColor,
  textStyle,
  onChange,
  onCancel,
  onCommit,
}: CanvasTextInputProps) {
  const inputRef = useRef<HTMLDivElement>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const textInputRef = useRef(textInput);
  const editorKeyRef = useRef('');
  const fontSize = textStyle.fontSize;
  const padding = 4;
  const lineHeight = fontSize * 1.2;
  const screenWidth = Math.max(80, textInput.w * textInput.scale);
  const screenHeight = Math.max((lineHeight + padding * 2) * textInput.scale, textInput.h * textInput.scale);

  useEffect(() => {
    textInputRef.current = textInput;
  }, [textInput]);

  useEffect(() => {
    if (!inputRef.current) return;
    const editorKey = `${textInput.x}:${textInput.y}:${textInput.screenX}:${textInput.screenY}`;
    if (editorKeyRef.current === editorKey) return;
    editorKeyRef.current = editorKey;
    inputRef.current.innerHTML = textInput.html;
    savedRangeRef.current = null;
    window.dispatchEvent(new CustomEvent('text-selection-change', { detail: { hasSelection: false } }));
  }, [textInput.html, textInput.screenX, textInput.screenY, textInput.x, textInput.y]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      inputRef.current?.focus();
      growToFitContent();
    });

    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const handleApplyStyle = (e: Event) => {
      const input = inputRef.current;
      if (!input) return;
      const { command, value } = (e as CustomEvent<{ command: string; value?: string | number }>).detail;

      input.focus();
      restoreSelection();

      if (command === 'fontSize') {
        applySpanStyle({ fontSize: `${value}px` });
      } else if (command === 'fontFamily') {
        applySpanStyle({ fontFamily: String(value) });
      } else if (command === 'foreColor') {
        applySpanStyle({ color: String(value) });
      } else {
        document.execCommand(command, false);
      }

      saveSelection();
      syncEditorState({ html: input.innerHTML });
      requestAnimationFrame(growToFitContent);
    };

    window.addEventListener('apply-text-style', handleApplyStyle);
    return () => window.removeEventListener('apply-text-style', handleApplyStyle);
  }, [onChange]);

  const saveSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || !inputRef.current?.contains(selection.anchorNode)) {
      window.dispatchEvent(new CustomEvent('text-selection-change', { detail: { hasSelection: false } }));
      return;
    }
    savedRangeRef.current = selection.getRangeAt(0).cloneRange();
    window.dispatchEvent(new CustomEvent('text-selection-change', { detail: { hasSelection: !selection.isCollapsed } }));
  };

  const restoreSelection = () => {
    const selection = window.getSelection();
    if (!selection || !savedRangeRef.current) return;
    selection.removeAllRanges();
    selection.addRange(savedRangeRef.current);
  };

  const applySpanStyle = (style: Partial<CSSStyleDeclaration>) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return;

    const range = selection.getRangeAt(0);
    if (!inputRef.current?.contains(range.commonAncestorContainer)) return;

    const span = document.createElement('span');
    Object.entries(style).forEach(([key, value]) => {
      if (value) span.style[key as any] = String(value);
    });
    span.appendChild(range.extractContents());
    range.insertNode(span);
    selection.removeAllRanges();
    const nextRange = document.createRange();
    nextRange.selectNodeContents(span);
    selection.addRange(nextRange);
  };

  const syncEditorState = (nextPartial: Partial<TextInputState>) => {
    const nextState = { ...textInputRef.current, ...nextPartial };
    textInputRef.current = nextState;
    onChange(nextState);
  };

  const growToFitContent = () => {
    const input = inputRef.current;
    const currentState = textInputRef.current;
    if (!input) return;

    const currentScreenHeight = currentState.h * currentState.scale;
    const requiredScreenHeight = input.scrollHeight + 4;
    if (requiredScreenHeight <= currentScreenHeight + 1) return;

    const nextHeight = Math.ceil(requiredScreenHeight / currentState.scale);
    input.style.height = `${nextHeight * currentState.scale}px`;
    syncEditorState({ h: nextHeight, html: input.innerHTML });
  };

  const startResize = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const startClientX = e.clientX;
    const startClientY = e.clientY;
    const startState = textInputRef.current;
    const startW = startState.w;
    const startH = startState.h;
    e.currentTarget.setPointerCapture(e.pointerId);

    const handleMove = (moveEvent: PointerEvent) => {
      const nextW = Math.max(40, startW + (moveEvent.clientX - startClientX) / startState.scale);
      const minHeight = lineHeight + padding * 2;
      const nextH = Math.max(minHeight, startH + (moveEvent.clientY - startClientY) / startState.scale);
      if (inputRef.current) {
        inputRef.current.style.width = `${nextW * startState.scale}px`;
        inputRef.current.style.height = `${nextH * startState.scale}px`;
      }
      syncEditorState({ w: nextW, h: nextH });
      requestAnimationFrame(growToFitContent);
    };

    const handleUp = () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
      inputRef.current?.focus();
      restoreSelection();
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
  };

  return createPortal(
    <div
      className="fixed shadow-xl"
      style={{
        left: textInput.screenX,
        top: textInput.screenY,
        zIndex: 2147483647,
      }}
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div
        ref={inputRef}
        contentEditable
        suppressContentEditableWarning
        className="outline-none overflow-hidden whitespace-pre-wrap break-words"
        style={{
          width: screenWidth,
          height: screenHeight,
          color: primaryColor,
          backgroundColor: backgroundMode === 'color' ? backgroundColor : 'rgba(255,255,255,0.15)',
          border: '2px dashed #0078d7',
          fontFamily: textStyle.fontFamily,
          fontSize: `${fontSize * textInput.scale}px`,
          fontWeight: textStyle.bold ? 700 : 400,
          fontStyle: textStyle.italic ? 'italic' : 'normal',
          textDecoration: textStyle.underline ? 'underline' : 'none',
          lineHeight: '1.2',
          padding: `${padding * textInput.scale}px`,
          margin: 0,
          pointerEvents: 'auto',
        }}
        onPointerDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onMouseUp={saveSelection}
        onKeyUp={saveSelection}
        onInput={(e) => {
          saveSelection();
          syncEditorState({ html: e.currentTarget.innerHTML });
          requestAnimationFrame(growToFitContent);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            e.preventDefault();
            onCancel();
          }
          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            onCommit();
          }
        }}
      />

      <div
        className="absolute -bottom-1.5 -right-1.5 h-4 w-4 cursor-se-resize border border-[#0078d7] bg-white"
        title="Resize text box"
        onPointerDown={startResize}
      />
    </div>,
    document.body,
  );
}
