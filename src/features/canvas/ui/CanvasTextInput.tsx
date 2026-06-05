import { Point } from '../model/types';

interface CanvasTextInputProps {
  textInput: Point & { text: string };
  primaryColor: string;
  strokeSize: number;
  onChange: (textInput: Point & { text: string }) => void;
  onCancel: () => void;
  onCommit: () => void;
}

export default function CanvasTextInput({
  textInput,
  primaryColor,
  strokeSize,
  onChange,
  onCancel,
  onCommit,
}: CanvasTextInputProps) {
  return (
    <textarea
      autoFocus
      className="absolute bg-transparent border border-blue-500 border-dashed outline-none resize-none overflow-hidden"
      style={{
        left: textInput.x,
        top: textInput.y,
        color: primaryColor,
        fontFamily: 'Arial',
        fontSize: `${Math.max(16, strokeSize * 4)}px`,
        lineHeight: '1.2',
        minWidth: '50px',
        minHeight: '30px',
        padding: 0,
        margin: 0,
        zIndex: 50,
        pointerEvents: 'auto',
      }}
      value={textInput.text}
      onChange={(e) => {
        e.target.style.height = 'auto';
        e.target.style.height = e.target.scrollHeight + 'px';
        e.target.style.width = 'auto';
        e.target.style.width = Math.max(50, e.target.scrollWidth) + 'px';
        onChange({ ...textInput, text: e.target.value });
      }}
      onBlur={onCommit}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          onCancel();
        }
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          onCommit();
        }
      }}
    />
  );
}
