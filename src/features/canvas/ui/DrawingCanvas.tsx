import React, { useEffect, useState, useRef } from 'react';
import { CanvasProps, CurveState, Point, PolygonState, SelectionState } from '../model/types';
import { getCanvasCursor } from '../model/cursor';
import { floodFill, hexToRgb } from '../lib/canvasPixels';
import { applyBrushStroke, drawShapePreview, isBrushTool, isShapeTool } from '../lib/drawingTools';
import { drawSelectionOverlay } from '../lib/selectionOverlay';
import { useCanvasCommands } from '../model/useCanvasCommands';
import CanvasGridlines from './CanvasGridlines';
import CanvasRulers from './CanvasRulers';
import CanvasTextInput from './CanvasTextInput';
import SelectionContextMenu from './SelectionContextMenu';

export default function DrawingCanvas({ currentTool, setCurrentTool, primaryColor, secondaryColor, strokeSize, width, height, canvasRef, onDraw, onColorPick, pastedImage, showRulers, showGridlines }: CanvasProps) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState<Point | null>(null);
  const [snapshot, setSnapshot] = useState<ImageData | null>(null);
  const [textInput, setTextInput] = useState<(Point & { text: string }) | null>(null);
  const [curveState, setCurveState] = useState<CurveState | null>(null);
  const [polygonState, setPolygonState] = useState<PolygonState | null>(null);
  
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const [selection, setSelection] = useState<SelectionState | null>(null);
  const [contextMenu, setContextMenu] = useState<Point | null>(null);

  const commitSelection = () => {
    if (selection?.image && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.drawImage(selection.image, selection.x, selection.y, selection.w, selection.h);
        onDraw(canvasRef.current.toDataURL());
      }
    }
    setSelection(null);
  };

  const rotateSelection = () => {
    if (!selection) return;
    const img = selection.image || extractSelection(true);
    if (!img) return;

    const canvas = document.createElement('canvas');
    canvas.width = selection.h;
    canvas.height = selection.w;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(Math.PI / 2);
    ctx.drawImage(img, -selection.w / 2, -selection.h / 2);

    setSelection({
      ...selection,
      x: selection.x + selection.w / 2 - selection.h / 2,
      y: selection.y + selection.h / 2 - selection.w / 2,
      w: selection.h,
      h: selection.w,
      image: canvas,
      path: undefined // Clear path as it's no longer valid
    });
    setContextMenu(null);
  };

  const flipSelection = (horizontal: boolean) => {
    if (!selection) return;
    const img = selection.image || extractSelection(true);
    if (!img) return;

    const canvas = document.createElement('canvas');
    canvas.width = selection.w;
    canvas.height = selection.h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (horizontal) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    } else {
      ctx.translate(0, canvas.height);
      ctx.scale(1, -1);
    }
    ctx.drawImage(img, 0, 0);

    setSelection({
      ...selection,
      image: canvas,
      path: undefined // Clear path as it's no longer valid
    });
    setContextMenu(null);
  };

  const extractSelection = (fillOriginal: boolean = false) => {
    if (!selection || !canvasRef.current) return null;
    if (selection.image) return selection.image;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    let tempCanvas = document.createElement('canvas');
    tempCanvas.width = selection.w;
    tempCanvas.height = selection.h;
    let tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return null;

    if (selection.path) {
      tempCtx.beginPath();
      tempCtx.moveTo(selection.path[0].x - selection.x, selection.path[0].y - selection.y);
      for (let i = 1; i < selection.path.length; i++) {
        tempCtx.lineTo(selection.path[i].x - selection.x, selection.path[i].y - selection.y);
      }
      tempCtx.closePath();
      tempCtx.clip();
      tempCtx.drawImage(canvas, selection.x, selection.y, selection.w, selection.h, 0, 0, selection.w, selection.h);
      
      if (fillOriginal) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(selection.path[0].x, selection.path[0].y);
        for (let i = 1; i < selection.path.length; i++) {
          ctx.lineTo(selection.path[i].x, selection.path[i].y);
        }
        ctx.closePath();
        ctx.fillStyle = secondaryColor;
        ctx.fill();
        ctx.restore();
        onDraw(canvas.toDataURL());
      }
    } else {
      const imgData = ctx.getImageData(selection.x, selection.y, selection.w, selection.h);
      tempCtx.putImageData(imgData, 0, 0);
      if (fillOriginal) {
        ctx.fillStyle = secondaryColor;
        ctx.fillRect(selection.x, selection.y, selection.w, selection.h);
        onDraw(canvas.toDataURL());
      }
    }
    return tempCanvas;
  };

  useEffect(() => {
    if (currentTool !== 'select' && currentTool !== 'lasso-select' && selection) {
      commitSelection();
    }
    if (currentTool !== 'curve' && curveState) {
      setCurveState(null);
    }
    if (currentTool !== 'polygon' && polygonState) {
      setPolygonState(null);
    }
  }, [currentTool, curveState, polygonState]);

  useEffect(() => {
    if (pastedImage && canvasRef.current) {
      if (selection) {
        commitSelection();
      }
      const img = new Image();
      img.onload = () => {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = img.width;
        tempCanvas.height = img.height;
        const tempCtx = tempCanvas.getContext('2d');
        if (tempCtx) {
          tempCtx.drawImage(img, 0, 0);
          setSelection({
            active: true,
            x: 0,
            y: 0,
            w: img.width,
            h: img.height,
            isMoving: false,
            startX: 0,
            startY: 0,
            image: tempCanvas,
            isPasted: true
          });
        }
      };
      img.src = pastedImage.src;
    }
  }, [pastedImage]);

  useEffect(() => {
    const overlay = overlayCanvasRef.current;
    const ctx = overlay?.getContext('2d');
    if (ctx) drawSelectionOverlay(ctx, selection, width, height);
  }, [selection, width, height]);

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    if (contextMenu) setContextMenu(null);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Получаем координаты относительно самого canvas элемента, учитывая масштабирование
    const rect = e.currentTarget.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.round((e.clientX - rect.left) * scaleX);
    const y = Math.round((e.clientY - rect.top) * scaleY);

    if (e.button === 2) {
      if (currentTool === 'picker') {
        const pixel = ctx.getImageData(x, y, 1, 1).data;
        const hex = `#${pixel[0].toString(16).padStart(2, '0')}${pixel[1].toString(16).padStart(2, '0')}${pixel[2].toString(16).padStart(2, '0')}`;
        if (onColorPick) onColorPick(hex, true);
        return;
      }
      if (currentTool === 'magnifier') {
        window.dispatchEvent(new CustomEvent('request-zoom-out'));
        return;
      }
      if (selection && selection.active && x >= selection.x && x <= selection.x + selection.w && y >= selection.y && y <= selection.y + selection.h) {
        setContextMenu({ x: e.clientX, y: e.clientY });
      }
      return;
    }

    if (currentTool === 'picker') {
      const pixel = ctx.getImageData(x, y, 1, 1).data;
      const hex = `#${pixel[0].toString(16).padStart(2, '0')}${pixel[1].toString(16).padStart(2, '0')}${pixel[2].toString(16).padStart(2, '0')}`;
      if (onColorPick) onColorPick(hex, false);
      return;
    }

    if (currentTool === 'magnifier') {
      window.dispatchEvent(new CustomEvent('request-zoom-in'));
      return;
    }

    if (currentTool === 'text') {
      setTextInput({ x, y, text: '' });
      return;
    }

    if (textInput) {
      setTextInput(null);
    }

    if (currentTool === 'curve') {
      if (curveState) {
        if (curveState.step === 1) {
          setCurveState({ ...curveState, cp1: {x, y} });
        } else if (curveState.step === 2) {
          setCurveState({ ...curveState, cp2: {x, y} });
        }
        setIsDrawing(true);
        return;
      } else {
        setCurveState({ step: 0, start: {x, y}, end: {x, y} });
      }
    }

    if (currentTool === 'polygon') {
      if (polygonState) {
        const firstPoint = polygonState.points[0];
        if (polygonState.points.length >= 2 && Math.abs(x - firstPoint.x) < 15 && Math.abs(y - firstPoint.y) < 15) {
          if (snapshot) {
            ctx.putImageData(snapshot, 0, 0);
            ctx.beginPath();
            ctx.moveTo(polygonState.points[0].x, polygonState.points[0].y);
            for (let i = 1; i < polygonState.points.length; i++) {
              ctx.lineTo(polygonState.points[i].x, polygonState.points[i].y);
            }
            ctx.closePath();
            ctx.strokeStyle = primaryColor;
            ctx.lineWidth = strokeSize;
            ctx.stroke();
            onDraw(canvas.toDataURL());
            setPolygonState(null);
            setIsDrawing(false);
          }
          return;
        }

        setPolygonState({
          ...polygonState,
          points: [...polygonState.points, {x, y}],
          currentPos: {x, y}
        });
      } else {
        setPolygonState({
          points: [{x, y}],
          currentPos: {x, y}
        });
        setSnapshot(ctx.getImageData(0, 0, canvas.width, canvas.height));
      }
      setIsDrawing(true);
      return;
    }

    if (currentTool === 'select' || currentTool === 'lasso-select') {
      if (selection && selection.active) {
        const handleSize = 10; // slightly larger hit area
        const handles = [
          { id: 'nw', x: selection.x - handleSize/2, y: selection.y - handleSize/2 },
          { id: 'n', x: selection.x + selection.w/2 - handleSize/2, y: selection.y - handleSize/2 },
          { id: 'ne', x: selection.x + selection.w - handleSize/2, y: selection.y - handleSize/2 },
          { id: 'w', x: selection.x - handleSize/2, y: selection.y + selection.h/2 - handleSize/2 },
          { id: 'e', x: selection.x + selection.w - handleSize/2, y: selection.y + selection.h/2 - handleSize/2 },
          { id: 'sw', x: selection.x - handleSize/2, y: selection.y + selection.h - handleSize/2 },
          { id: 's', x: selection.x + selection.w/2 - handleSize/2, y: selection.y + selection.h - handleSize/2 },
          { id: 'se', x: selection.x + selection.w - handleSize/2, y: selection.y + selection.h - handleSize/2 },
        ];
        
        const clickedHandle = handles.find(h => 
          x >= h.x && x <= h.x + handleSize && 
          y >= h.y && y <= h.y + handleSize
        );

        if (clickedHandle) {
          if (!selection.image) {
            const tempCanvas = extractSelection(true);
            setSelection({ ...selection, isResizing: clickedHandle.id, startX: x, startY: y, startW: selection.w, startH: selection.h, startOriginX: selection.x, startOriginY: selection.y, image: tempCanvas });
          } else {
            setSelection({ ...selection, isResizing: clickedHandle.id, startX: x, startY: y, startW: selection.w, startH: selection.h, startOriginX: selection.x, startOriginY: selection.y });
          }
          return;
        }

        if (x >= selection.x && x <= selection.x + selection.w && y >= selection.y && y <= selection.y + selection.h) {
          if (!selection.image) {
            const tempCanvas = extractSelection(true);
            setSelection({ ...selection, isMoving: true, startX: x, startY: y, image: tempCanvas });
          } else {
            setSelection({ ...selection, isMoving: true, startX: x, startY: y });
          }
          return;
        } else {
          commitSelection();
        }
      }
      
      setSelection({ 
        active: false, 
        x, y, w: 0, h: 0, 
        isMoving: false, 
        startX: x, startY: y, 
        image: null,
        path: currentTool === 'lasso-select' ? [{x, y}] : undefined
      });
      setIsDrawing(true);
      setStartPos({ x, y });
      return;
    }

    setIsDrawing(true);
    setStartPos({ x, y });
    setSnapshot(ctx.getImageData(0, 0, canvas.width, canvas.height));

    ctx.beginPath();
    ctx.moveTo(x, y);

    if (currentTool === 'fill') {
       floodFill(ctx, Math.floor(x), Math.floor(y), hexToRgb(primaryColor));
       setIsDrawing(false);
       onDraw(canvas.toDataURL());
    }
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (currentTool === 'select' || currentTool === 'lasso-select') {
      if (!isDrawing && !selection?.isMoving && !selection?.isResizing) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      // Получаем координаты относительно самого canvas элемента, учитывая масштабирование
      const rect = e.currentTarget.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = Math.round((e.clientX - rect.left) * scaleX);
      const y = Math.round((e.clientY - rect.top) * scaleY);

      if (selection?.isResizing && selection.image && selection.startW !== undefined) {
        const dx = x - selection.startX;
        const dy = y - selection.startY;
        setSelection(prev => {
          if (!prev) return null;
          let newX = prev.startOriginX!;
          let newY = prev.startOriginY!;
          let newW = prev.startW!;
          let newH = prev.startH!;

          if (prev.isResizing?.includes('w')) {
            newX = Math.min(prev.startOriginX! + dx, prev.startOriginX! + prev.startW! - 1);
            newW = prev.startOriginX! + prev.startW! - newX;
          }
          if (prev.isResizing?.includes('e')) {
            newW = Math.max(1, prev.startW! + dx);
          }
          if (prev.isResizing?.includes('n')) {
            newY = Math.min(prev.startOriginY! + dy, prev.startOriginY! + prev.startH! - 1);
            newH = prev.startOriginY! + prev.startH! - newY;
          }
          if (prev.isResizing?.includes('s')) {
            newH = Math.max(1, prev.startH! + dy);
          }

          return {
            ...prev,
            x: newX,
            y: newY,
            w: Math.max(1, newW),
            h: Math.max(1, newH)
          };
        });
      } else if (selection?.isMoving && selection.image) {
        const dx = x - selection.startX;
        const dy = y - selection.startY;
        setSelection(prev => prev ? {
          ...prev,
          x: prev.x + dx,
          y: prev.y + dy,
          startX: x,
          startY: y
        } : null);
      } else if (isDrawing && selection && !selection.active && startPos) {
        if (currentTool === 'lasso-select') {
          setSelection(prev => prev && prev.path ? {
            ...prev,
            path: [...prev.path, {x, y}]
          } : prev);
        } else {
          setSelection(prev => prev ? {
            ...prev,
            w: x - startPos.x,
            h: y - startPos.y
          } : prev);
        }
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Получаем координаты относительно самого canvas элемента, учитывая масштабирование
    const rect = e.currentTarget.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.round((e.clientX - rect.left) * scaleX);
    const y = Math.round((e.clientY - rect.top) * scaleY);

    if (currentTool === 'curve' && curveState) {
      if (curveState.step === 0) {
        setCurveState(prev => prev ? { ...prev, end: {x, y} } : prev);
      } else if (curveState.step === 1) {
        setCurveState(prev => prev ? { ...prev, cp1: {x, y} } : prev);
      } else if (curveState.step === 2) {
        setCurveState(prev => prev ? { ...prev, cp2: {x, y} } : prev);
      }
      
      if (snapshot) {
        ctx.putImageData(snapshot, 0, 0);
        ctx.beginPath();
        ctx.moveTo(curveState.start.x, curveState.start.y);
        if (curveState.step === 0) {
          ctx.lineTo(x, y);
        } else if (curveState.step === 1) {
          ctx.quadraticCurveTo(x, y, curveState.end.x, curveState.end.y);
        } else if (curveState.step === 2) {
          ctx.bezierCurveTo(
            curveState.cp1!.x, curveState.cp1!.y,
            x, y,
            curveState.end.x, curveState.end.y
          );
        }
        ctx.strokeStyle = primaryColor;
        ctx.lineWidth = strokeSize;
        ctx.stroke();
      }
      return;
    }

    if (currentTool === 'polygon' && polygonState) {
      setPolygonState(prev => prev ? { ...prev, currentPos: {x, y} } : prev);
      
      if (snapshot) {
        ctx.putImageData(snapshot, 0, 0);
        ctx.beginPath();
        ctx.moveTo(polygonState.points[0].x, polygonState.points[0].y);
        for (let i = 1; i < polygonState.points.length; i++) {
          ctx.lineTo(polygonState.points[i].x, polygonState.points[i].y);
        }
        ctx.lineTo(x, y);
        ctx.strokeStyle = primaryColor;
        ctx.lineWidth = strokeSize;
        ctx.stroke();
      }
      return;
    }

    if (!isDrawing || !startPos) return;

    if (isBrushTool(currentTool)) {
      applyBrushStroke(ctx, currentTool, { x, y }, primaryColor, secondaryColor, strokeSize);
    } else if (snapshot && isShapeTool(currentTool)) {
      ctx.putImageData(snapshot, 0, 0);
      drawShapePreview(ctx, currentTool, startPos, { x, y }, strokeSize, primaryColor, e.shiftKey);
    }
  };

  const stopDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    if (currentTool === 'select' || currentTool === 'lasso-select') {
      setSelection(prev => {
        if (!prev) return prev;
        if (prev.isResizing) {
          return { ...prev, isResizing: null };
        } else if (prev.isMoving) {
          return { ...prev, isMoving: false };
        } else if (isDrawing && !prev.active) {
          if (currentTool === 'lasso-select' && prev.path && prev.path.length > 2) {
            let minX = prev.path[0].x;
            let minY = prev.path[0].y;
            let maxX = prev.path[0].x;
            let maxY = prev.path[0].y;
            
            for (const p of prev.path) {
              if (p.x < minX) minX = p.x;
              if (p.y < minY) minY = p.y;
              if (p.x > maxX) maxX = p.x;
              if (p.y > maxY) maxY = p.y;
            }
            
            return {
              ...prev,
              active: true,
              x: minX,
              y: minY,
              w: maxX - minX,
              h: maxY - minY
            };
          } else if (currentTool === 'select' && prev.w !== 0 && prev.h !== 0) {
            const normX = prev.w < 0 ? prev.x + prev.w : prev.x;
            const normY = prev.h < 0 ? prev.y + prev.h : prev.y;
            const normW = Math.abs(prev.w);
            const normH = Math.abs(prev.h);
            return { ...prev, active: true, x: normX, y: normY, w: normW, h: normH };
          } else {
            return null;
          }
        }
        return prev;
      });
      setIsDrawing(false);
      return;
    }

    if (currentTool === 'curve' && curveState) {
      if (curveState.step === 0) {
        setCurveState({ ...curveState, step: 1, cp1: curveState.end, cp2: curveState.end });
      } else if (curveState.step === 1) {
        setCurveState({ ...curveState, step: 2, cp2: curveState.cp1 });
      } else if (curveState.step === 2) {
        if (canvasRef.current && snapshot) {
          const ctx = canvasRef.current.getContext('2d');
          if (ctx) {
            ctx.putImageData(snapshot, 0, 0);
            ctx.beginPath();
            ctx.moveTo(curveState.start.x, curveState.start.y);
            ctx.bezierCurveTo(
              curveState.cp1!.x, curveState.cp1!.y,
              curveState.cp2!.x, curveState.cp2!.y,
              curveState.end.x, curveState.end.y
            );
            ctx.strokeStyle = primaryColor;
            ctx.lineWidth = strokeSize;
            ctx.stroke();
            onDraw(canvasRef.current.toDataURL());
          }
        }
        setCurveState(null);
      }
      setIsDrawing(false);
      return;
    }

    if (currentTool === 'polygon') {
      // Do nothing on pointer up for polygon, wait for double click
      return;
    }

    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
       const ctx = canvas.getContext('2d');
       if (ctx) ctx.closePath();
       onDraw(canvas.toDataURL());
    }
  };

  const {
    handleCopy,
    handleCrop,
    handleCut,
    handleDelete,
    handleInvertColor,
    handleSelectAll,
  } = useCanvasCommands({
    canvasRef,
    overlayCanvasRef,
    selection,
    setSelection,
    curveState,
    setCurveState,
    polygonState,
    setPolygonState,
    setContextMenu,
    setCurrentTool,
    extractSelection,
    commitSelection,
    rotateSelection,
    secondaryColor,
    width,
    height,
    onDraw,
  });


  const commitTextInput = () => {
    if (textInput?.text.trim() && canvasRef.current) {
      const fontSize = Math.max(16, strokeSize * 4);
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.font = `${fontSize}px Arial`;
        ctx.fillStyle = primaryColor;
        ctx.textBaseline = 'top';
        textInput.text.split('\n').forEach((line, i) => {
          ctx.fillText(line, textInput.x, textInput.y + i * (fontSize * 1.2));
        });
        onDraw(canvasRef.current.toDataURL());
      }
    }
    setTextInput(null);
  };

  const handleDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (currentTool === 'polygon' && polygonState) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx || !snapshot) return;

      ctx.putImageData(snapshot, 0, 0);
      ctx.beginPath();
      ctx.moveTo(polygonState.points[0].x, polygonState.points[0].y);
      for (let i = 1; i < polygonState.points.length; i++) {
        ctx.lineTo(polygonState.points[i].x, polygonState.points[i].y);
      }
      ctx.closePath();
      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = strokeSize;
      ctx.stroke();
      onDraw(canvas.toDataURL());
      setPolygonState(null);
      setIsDrawing(false);
    }
  };

  return (
    <div className="relative shadow-md bg-white" style={{ width, height }} onContextMenu={(e) => e.preventDefault()}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="absolute top-0 left-0 touch-none"
        style={{ cursor: getCanvasCursor(currentTool, selection?.isMoving) }}
        onPointerDown={startDrawing}
        onPointerMove={draw}
        onPointerUp={stopDrawing}
        onDoubleClick={handleDoubleClick}
      />
      <canvas
        ref={overlayCanvasRef}
        width={width}
        height={height}
        className="absolute top-0 left-0 pointer-events-none"
        style={{ zIndex: 45 }}
      />

      {showGridlines && <CanvasGridlines />}

      {showRulers && <CanvasRulers width={width} height={height} />}

      {textInput && (
        <CanvasTextInput
          textInput={textInput}
          primaryColor={primaryColor}
          strokeSize={strokeSize}
          onChange={setTextInput}
          onCancel={() => setTextInput(null)}
          onCommit={commitTextInput}
        />
      )}

      {contextMenu && (
        <SelectionContextMenu
          position={contextMenu}
          onCopy={handleCopy}
          onCrop={handleCrop}
          onCut={handleCut}
          onDelete={handleDelete}
          onFlip={() => flipSelection(true)}
          onInvertColor={handleInvertColor}
          onRotate={rotateSelection}
          onSelectAll={handleSelectAll}
        />
      )}
    </div>
  );
}
