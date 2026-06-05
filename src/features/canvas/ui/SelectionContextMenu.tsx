import { ArrowLeftRight, ClipboardPaste, Copy, Crop, Image as ImageIcon, Maximize2, RotateCw, Scissors, Sparkles, SquareDashed, Trash2 } from 'lucide-react';
import { t } from '../../../shared/i18n';
import { Point } from '../model/types';

interface SelectionContextMenuProps {
  position: Point;
  onCopy: () => void;
  onCrop: () => void;
  onCut: () => void;
  onDelete: () => void;
  onFlip: () => void;
  onInvertColor: () => void;
  onRotate: () => void;
  onSelectAll: () => void;
}

export default function SelectionContextMenu({
  position,
  onCopy,
  onCrop,
  onCut,
  onDelete,
  onFlip,
  onInvertColor,
  onRotate,
  onSelectAll,
}: SelectionContextMenuProps) {
  return (
    <div
      className="fixed z-[100] w-64 bg-[#2b2b2b] border border-[#404040] rounded-md shadow-2xl py-1 text-gray-200 text-sm select-none"
      style={{ left: position.x, top: position.y }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <button className="w-full flex items-center px-4 py-1.5 hover:bg-white/10 text-left justify-between" onClick={onCut}>
        <div className="flex items-center"><Scissors size={16} className="mr-3" /> {t('action.cut')}</div>
        <span className="text-xs text-gray-400">Ctrl+X</span>
      </button>
      <button className="w-full flex items-center px-4 py-1.5 hover:bg-white/10 text-left justify-between" onClick={onCopy}>
        <div className="flex items-center"><Copy size={16} className="mr-3" /> {t('action.copy')}</div>
        <span className="text-xs text-gray-400">Ctrl+C</span>
      </button>
      <button className="w-full flex items-center px-4 py-1.5 hover:bg-white/10 text-left justify-between text-gray-500" disabled>
        <div className="flex items-center"><ClipboardPaste size={16} className="mr-3" /> {t('action.paste')}</div>
        <span className="text-xs text-gray-400">Ctrl+V</span>
      </button>
      <div className="h-px bg-white/10 my-1 mx-2" />
      <button className="w-full flex items-center px-4 py-1.5 hover:bg-white/10 text-left justify-between">
        <div className="flex items-center"><Copy size={16} className="mr-3" /> {t('action.copyVisible')}</div>
        <span className="text-xs text-gray-400">Ctrl+Shift+C</span>
      </button>
      <button className="w-full flex items-center px-4 py-1.5 hover:bg-white/10 text-left justify-between" onClick={onCrop}>
        <div className="flex items-center"><Crop size={16} className="mr-3" /> {t('action.crop')}</div>
        <span className="text-xs text-gray-400">Ctrl+Shift+X</span>
      </button>
      <button className="w-full flex items-center px-4 py-1.5 hover:bg-white/10 text-left justify-between" onClick={onSelectAll}>
        <div className="flex items-center"><Maximize2 size={16} className="mr-3" /> {t('action.selectAll')}</div>
        <span className="text-xs text-gray-400">Ctrl+A</span>
      </button>
      <button className="w-full flex items-center px-4 py-1.5 hover:bg-white/10 text-left text-gray-500" disabled>
        <div className="flex items-center"><SquareDashed size={16} className="mr-3" /> {t('action.invertSelect')}</div>
      </button>
      <button className="w-full flex items-center px-4 py-1.5 hover:bg-white/10 text-left justify-between" onClick={onDelete}>
        <div className="flex items-center"><Trash2 size={16} className="mr-3" /> {t('action.delete')}</div>
        <span className="text-xs text-gray-400">Delete</span>
      </button>
      <div className="h-px bg-white/10 my-1 mx-2" />
      <button className="w-full flex items-center px-4 py-1.5 hover:bg-white/10 text-left text-gray-500" disabled>
        <div className="flex items-center"><ImageIcon size={16} className="mr-3" /> {t('action.removeBg')}</div>
      </button>
      <button className="w-full flex items-center px-4 py-1.5 hover:bg-white/10 text-left text-gray-500" disabled>
        <div className="flex items-center"><Sparkles size={16} className="mr-3" /> {t('action.genRemove')}</div>
      </button>
      <div className="h-px bg-white/10 my-1 mx-2" />
      <button className="w-full flex items-center px-4 py-1.5 hover:bg-white/10 text-left justify-between" onClick={onRotate}>
        <div className="flex items-center"><RotateCw size={16} className="mr-3" /> {t('action.rotate')}</div>
      </button>
      <button className="w-full flex items-center px-4 py-1.5 hover:bg-white/10 text-left justify-between" onClick={onFlip}>
        <div className="flex items-center"><ArrowLeftRight size={16} className="mr-3" /> {t('action.flip')}</div>
      </button>
      <button className="w-full flex items-center px-4 py-1.5 hover:bg-white/10 text-left justify-between" onClick={() => window.dispatchEvent(new CustomEvent('request-resize'))}>
        <div className="flex items-center"><Maximize2 size={16} className="mr-3" /> {t('action.resize')}</div>
        <span className="text-xs text-gray-400">Ctrl+E</span>
      </button>
      <button className="w-full flex items-center px-4 py-1.5 hover:bg-white/10 text-left justify-between" onClick={onInvertColor}>
        <div className="flex items-center"><ImageIcon size={16} className="mr-3" /> {t('action.invert')}</div>
        <span className="text-xs text-gray-400">Ctrl+Shift+I</span>
      </button>
    </div>
  );
}
