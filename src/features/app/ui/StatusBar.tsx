import { Maximize2, MousePointer2, Square, ZoomIn, ZoomOut } from 'lucide-react';
import { CanvasSize, Point } from '../model/types';

interface StatusBarProps {
  canvasSize: CanvasSize;
  mousePos: Point | null;
  zoom: number;
  onZoomChange: (updater: number | ((prev: number) => number)) => void;
}

export default function StatusBar({ canvasSize, mousePos, zoom, onZoomChange }: StatusBarProps) {
  return (
    <div className="h-8 bg-[#202020] border-t border-black/40 flex items-center px-4 text-[11px] text-gray-400 justify-between">
      <div className="flex gap-6">
        <div className="flex items-center gap-1.5 hover:bg-white/5 px-2 py-1 rounded cursor-pointer">
          <MousePointer2 size={12} />
          <span>{mousePos ? `${mousePos.x}, ${mousePos.y} px` : ''}</span>
        </div>
        <div className="flex items-center gap-1.5 hover:bg-white/5 px-2 py-1 rounded cursor-pointer">
          <Square size={12} />
          <span>{canvasSize.width} × {canvasSize.height}px</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Maximize2 size={12} className="cursor-pointer hover:text-white mr-2" onClick={() => onZoomChange(1)} />
        <span className="w-10 text-right">{Math.round(zoom * 100)}%</span>
        <ZoomOut size={14} className="cursor-pointer hover:text-white" onClick={() => onZoomChange(prev => Math.max(0.1, prev - 0.1))} />
        <input
          type="range"
          min="0.1"
          max="5"
          step="0.1"
          value={zoom}
          onChange={(e) => onZoomChange(parseFloat(e.target.value))}
          className="w-24 h-1 bg-gray-600 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-gray-300 [&::-webkit-slider-thumb]:rounded-sm"
        />
        <ZoomIn size={14} className="cursor-pointer hover:text-white" onClick={() => onZoomChange(prev => Math.min(5, prev + 0.1))} />
      </div>
    </div>
  );
}
