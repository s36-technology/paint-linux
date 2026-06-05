import React from 'react';
import DrawingCanvas from '../../canvas/ui/DrawingCanvas';
import { TextBackgroundMode } from '../../canvas/model/types';
import { Tool } from '../../../shared/types';
import { CanvasSize, Point } from '../model/types';
import StrokeSizeSlider from './StrokeSizeSlider';
import ThumbnailWindow from './ThumbnailWindow';

type ResizeDirection = 'e' | 's' | 'se' | 'w' | 'n' | 'nw' | 'sw' | 'ne';

interface LiveResizeBox {
  w: number;
  h: number;
  x: number;
  y: number;
}

interface CanvasWorkspaceProps {
  canvasContainerRef: React.RefObject<HTMLDivElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  canvasSize: CanvasSize;
  currentTool: Tool;
  history: string[];
  historyStep: number;
  isDraggingThumbnail: boolean;
  liveResizeBox: LiveResizeBox | null;
  pastedImage: { src: string; id: number } | null;
  primaryColor: string;
  secondaryColor: string;
  textBackgroundMode: TextBackgroundMode;
  textBackgroundColor: string;
  showGridlines: boolean;
  showRulers: boolean;
  showThumbnail: boolean;
  strokeSize: number;
  thumbnailDragStart: Point;
  thumbnailPos: Point;
  zoom: number;
  onColorPick: (color: string, isSecondary: boolean) => void;
  onDropImage: (e: React.DragEvent<HTMLDivElement>) => void;
  onDraw: (dataUrl?: string) => void;
  onMousePosChange: (point: Point | null) => void;
  onResizeStartChange: (resizeStart: { x: number; y: number; w: number; h: number }) => void;
  onSetCurrentTool: (tool: Tool) => void;
  onSetIsDraggingThumbnail: (isDragging: boolean) => void;
  onSetIsResizingCanvas: (direction: ResizeDirection) => void;
  onSetStrokeSize: (strokeSize: number) => void;
  onSetThumbnailDragStart: (point: Point) => void;
  onSetThumbnailPos: React.Dispatch<React.SetStateAction<Point>>;
  onSetShowThumbnail: (show: boolean) => void;
}

const RESIZE_HANDLES: Array<{ direction: ResizeDirection; className: string }> = [
  { direction: 'e', className: 'top-1/2 -right-1.5 cursor-e-resize -translate-y-1/2' },
  { direction: 'w', className: 'top-1/2 -left-1.5 cursor-w-resize -translate-y-1/2' },
  { direction: 'n', className: '-top-1.5 left-1/2 cursor-n-resize -translate-x-1/2' },
  { direction: 's', className: '-bottom-1.5 left-1/2 cursor-s-resize -translate-x-1/2' },
  { direction: 'nw', className: '-top-1.5 -left-1.5 cursor-nw-resize' },
  { direction: 'ne', className: '-top-1.5 -right-1.5 cursor-ne-resize' },
  { direction: 'sw', className: '-bottom-1.5 -left-1.5 cursor-sw-resize' },
  { direction: 'se', className: '-bottom-1.5 -right-1.5 cursor-se-resize' },
];

export default function CanvasWorkspace({
  canvasContainerRef,
  canvasRef,
  canvasSize,
  currentTool,
  history,
  historyStep,
  isDraggingThumbnail,
  liveResizeBox,
  pastedImage,
  primaryColor,
  secondaryColor,
  textBackgroundMode,
  textBackgroundColor,
  showGridlines,
  showRulers,
  showThumbnail,
  strokeSize,
  thumbnailDragStart,
  thumbnailPos,
  zoom,
  onColorPick,
  onDropImage,
  onDraw,
  onMousePosChange,
  onResizeStartChange,
  onSetCurrentTool,
  onSetIsDraggingThumbnail,
  onSetIsResizingCanvas,
  onSetStrokeSize,
  onSetThumbnailDragStart,
  onSetThumbnailPos,
  onSetShowThumbnail,
}: CanvasWorkspaceProps) {
  const startResize = (direction: ResizeDirection, e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    onSetIsResizingCanvas(direction);
    onResizeStartChange({ x: e.clientX, y: e.clientY, w: canvasSize.width, h: canvasSize.height });
  };

  return (
    <div
      ref={canvasContainerRef}
      className="flex-1 overflow-auto bg-[#202020] relative"
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDropImage}
    >
      <StrokeSizeSlider strokeSize={strokeSize} onStrokeSizeChange={onSetStrokeSize} />

      {showThumbnail && history[historyStep] && (
        <ThumbnailWindow
          imageSrc={history[historyStep]}
          position={thumbnailPos}
          isDragging={isDraggingThumbnail}
          dragStart={thumbnailDragStart}
          onClose={() => onSetShowThumbnail(false)}
          onDragStartChange={onSetThumbnailDragStart}
          onDraggingChange={onSetIsDraggingThumbnail}
          onPositionChange={onSetThumbnailPos}
        />
      )}

      <div className="min-w-fit min-h-fit p-8 flex relative" style={{ minWidth: '100%', minHeight: '100%' }}>
        <div style={{ width: Math.max(canvasSize.width * zoom, 100), height: Math.max(canvasSize.height * zoom, 100) }} className="relative shrink-0 m-auto">
          <div
            className="absolute top-0 left-0 bg-white shadow-sm"
            style={{
              width: canvasSize.width,
              height: canvasSize.height,
              transform: `scale(${zoom})`,
              transformOrigin: 'top left',
            }}
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = Math.round((e.clientX - rect.left) / zoom);
              const y = Math.round((e.clientY - rect.top) / zoom);
              onMousePosChange({ x, y });
            }}
            onMouseLeave={() => onMousePosChange(null)}
          >
            <DrawingCanvas
              currentTool={currentTool}
              setCurrentTool={onSetCurrentTool}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
              textBackgroundMode={textBackgroundMode}
              textBackgroundColor={textBackgroundColor}
              strokeSize={strokeSize}
              width={canvasSize.width}
              height={canvasSize.height}
              canvasRef={canvasRef}
              onDraw={onDraw}
              showRulers={showRulers}
              showGridlines={showGridlines}
              onColorPick={onColorPick}
              pastedImage={pastedImage}
            />

            {liveResizeBox && (
              <div
                className="absolute pointer-events-none z-50 border-2 border-[#4cc2ff] border-dashed"
                style={{ left: liveResizeBox.x, top: liveResizeBox.y, width: liveResizeBox.w, height: liveResizeBox.h }}
              />
            )}

            {RESIZE_HANDLES.map(handle => (
              <div
                key={handle.direction}
                className={`absolute w-3 h-3 bg-white border border-gray-400 ${handle.className}`}
                onMouseDown={(e) => startResize(handle.direction, e)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
