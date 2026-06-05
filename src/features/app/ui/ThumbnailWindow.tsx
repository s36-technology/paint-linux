import { t } from '../../../shared/i18n';
import { Point } from '../model/types';

interface ThumbnailWindowProps {
  imageSrc: string;
  position: Point;
  isDragging: boolean;
  dragStart: Point;
  onClose: () => void;
  onDragStartChange: (point: Point) => void;
  onDraggingChange: (isDragging: boolean) => void;
  onPositionChange: (updater: (prev: Point) => Point) => void;
}

export default function ThumbnailWindow({
  imageSrc,
  position,
  isDragging,
  dragStart,
  onClose,
  onDragStartChange,
  onDraggingChange,
  onPositionChange,
}: ThumbnailWindowProps) {
  return (
    <div
      className="fixed w-56 bg-[#2b2b2b] border border-[#404040] rounded shadow-2xl z-40 overflow-hidden flex flex-col"
      style={{ top: Math.max(120, position.y), right: position.x }}
    >
      <div
        className="bg-[#1e1e1e] px-2 py-1 text-xs text-gray-400 flex justify-between items-center border-b border-[#404040] cursor-move select-none"
        onPointerDown={(e) => {
          onDraggingChange(true);
          onDragStartChange({ x: e.clientX, y: e.clientY });
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (isDragging) {
            const dx = e.clientX - dragStart.x;
            const dy = e.clientY - dragStart.y;
            onPositionChange(prev => ({ x: Math.max(0, prev.x - dx), y: Math.max(120, prev.y + dy) }));
            onDragStartChange({ x: e.clientX, y: e.clientY });
          }
        }}
        onPointerUp={(e) => {
          onDraggingChange(false);
          e.currentTarget.releasePointerCapture(e.pointerId);
        }}
        onPointerCancel={(e) => {
          onDraggingChange(false);
          e.currentTarget.releasePointerCapture(e.pointerId);
        }}
      >
        <span>{t('action.thumbnail')}</span>
        <button onClick={onClose} className="hover:text-white cursor-pointer">&times;</button>
      </div>
      <div className="p-2 bg-white/5 flex-1 flex justify-center items-center min-h-[180px]">
        <img
          src={imageSrc}
          alt="Thumbnail"
          className="w-full h-full object-contain bg-white"
          style={{ maxHeight: '300px' }}
          referrerPolicy="no-referrer"
        />
      </div>
    </div>
  );
}
