import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { TextBackgroundMode, TextInputState } from '../model/types';

interface CanvasTextInputProps {
  textInput: TextInputState;
  primaryColor: string;
  backgroundMode: TextBackgroundMode;
  backgroundColor: string;
  strokeSize: number;
  onChange: (textInput: TextInputState) => void;
  onCancel: () => void;
  onCommit: () => void;
}

export default function CanvasTextInput({
  textInput,
  primaryColor,
  backgroundMode,
  backgroundColor,
  strokeSize,
  onChange,
  onCancel,
  onCommit,
}: CanvasTextInputProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fontSize = Math.max(16, strokeSize * 4);
  const padding = 4;
  const lineHeight = fontSize * 1.2;
  const screenWidth = Math.max(80, textInput.w * textInput.scale);
  const screenHeight = Math.max((lineHeight + padding * 2) * textInput.scale, textInput.h * textInput.scale);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      inputRef.current?.focus();
    });

    return () => cancelAnimationFrame(frame);
  }, []);

  const startResize = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const startClientX = e.clientX;
    const startClientY = e.clientY;
    const startW = textInput.w;
    const startH = textInput.h;
    e.currentTarget.setPointerCapture(e.pointerId);

    const handleMove = (moveEvent: PointerEvent) => {
      const nextW = Math.max(40, startW + (moveEvent.clientX - startClientX) / textInput.scale);
      const minHeight = lineHeight + padding * 2;
      const nextH = Math.max(minHeight, startH + (moveEvent.clientY - startClientY) / textInput.scale);
      onChange({ ...textInput, w: nextW, h: nextH });
    };

    const handleUp = () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
      inputRef.current?.focus();
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
      <textarea
        ref={inputRef}
        autoFocus
        className="outline-none resize-none overflow-hidden"
        style={{
          width: screenWidth,
          height: screenHeight,
          color: primaryColor,
          backgroundColor: backgroundMode === 'color' ? backgroundColor : 'rgba(255,255,255,0.15)',
          border: '2px dashed #0078d7',
          fontFamily: 'Arial',
          fontSize: `${fontSize * textInput.scale}px`,
          lineHeight: '1.2',
          padding: `${padding * textInput.scale}px`,
          margin: 0,
          pointerEvents: 'auto',
        }}
        value={textInput.text}
        placeholder="Type text"
        onPointerDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onChange={(e) => {
          onChange({ ...textInput, text: e.target.value });
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            e.preventDefault();
            onCancel();
          }
          if (e.key === 'Enter' && !e.shiftKey) {
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
