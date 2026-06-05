import React, { useEffect } from 'react';
import { CurveState, PolygonState, SelectionState } from './types';
import { Tool } from '../../../shared/types';

interface UseCanvasCommandsParams {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  overlayCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  selection: SelectionState | null;
  setSelection: React.Dispatch<React.SetStateAction<SelectionState | null>>;
  curveState: CurveState | null;
  setCurveState: React.Dispatch<React.SetStateAction<CurveState | null>>;
  polygonState: PolygonState | null;
  setPolygonState: React.Dispatch<React.SetStateAction<PolygonState | null>>;
  setContextMenu: React.Dispatch<React.SetStateAction<{ x: number; y: number } | null>>;
  setCurrentTool: (tool: Tool) => void;
  extractSelection: (fillOriginal?: boolean) => HTMLCanvasElement | null;
  commitSelection: () => void;
  rotateSelection: () => void;
  secondaryColor: string;
  width: number;
  height: number;
  onDraw: (dataUrl?: string) => void;
}

export function useCanvasCommands({
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
}: UseCanvasCommandsParams) {
  const handleCopy = () => {
    const img = selection?.image || extractSelection(false);
    if (img) {
      img.toBlob(blob => {
        if (blob) navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      });
    }
    setContextMenu(null);
  };

  const handleCut = () => {
    const img = selection?.image || extractSelection(true);
    if (img) {
      img.toBlob(blob => {
        if (blob) navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      });
    }
    setSelection(null);
    setContextMenu(null);
  };

  const handleDelete = () => {
    if (selection && !selection.image) {
      extractSelection(true);
    }
    setSelection(null);
    setContextMenu(null);
  };

  const handleSelectAll = () => {
    setSelection({
      active: true,
      x: 0,
      y: 0,
      w: width,
      h: height,
      isMoving: false,
      startX: 0,
      startY: 0,
      image: null,
      path: undefined,
    });
    setContextMenu(null);
  };

  const handleCrop = () => {
    if (selection && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        const img = selection.image || extractSelection(false);
        ctx.fillStyle = secondaryColor;
        ctx.fillRect(0, 0, width, height);
        if (img) {
          ctx.drawImage(img, selection.x, selection.y);
        }
        onDraw(canvasRef.current.toDataURL());
      }
      setSelection(null);
    }
    setContextMenu(null);
  };

  const handleInvertColor = () => {
    if (selection && canvasRef.current) {
      const img = selection.image || extractSelection(false);
      if (img) {
        const tempCtx = img.getContext('2d');
        if (tempCtx) {
          const imgData = tempCtx.getImageData(0, 0, selection.w, selection.h);
          const data = imgData.data;
          for (let i = 0; i < data.length; i += 4) {
            if (data[i + 3] > 0) {
              data[i] = 255 - data[i];
              data[i + 1] = 255 - data[i + 1];
              data[i + 2] = 255 - data[i + 2];
            }
          }
          tempCtx.putImageData(imgData, 0, 0);

          if (!selection.image) {
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) {
              ctx.save();
              if (selection.path) {
                ctx.beginPath();
                ctx.moveTo(selection.path[0].x, selection.path[0].y);
                for (let i = 1; i < selection.path.length; i++) {
                  ctx.lineTo(selection.path[i].x, selection.path[i].y);
                }
                ctx.closePath();
                ctx.clip();
                ctx.clearRect(selection.x, selection.y, selection.w, selection.h);
              }
              ctx.drawImage(img, selection.x, selection.y);
              ctx.restore();
              onDraw(canvasRef.current.toDataURL());
            }
          } else {
            setSelection({ ...selection, image: img });
          }
        }
      }
    }
    setContextMenu(null);
  };

  useEffect(() => {
    const handleCommitSelection = () => {
      if (selection) {
        commitSelection();
      }
    };

    const handleRequestCopy = async () => {
      if (canvasRef.current) {
        try {
          const blob = await new Promise<Blob | null>(resolve => {
            canvasRef.current!.toBlob(resolve, 'image/png');
          });
          if (blob) {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob }),
            ]);
          }
        } catch (err) {
          console.error('Failed to copy image: ', err);
        }
      }
    };

    const handleRequestCut = async () => {
      if (selection) {
        const img = selection.image || extractSelection(true);
        if (img) {
          try {
            const blob = await new Promise<Blob | null>(resolve => {
              img.toBlob(resolve, 'image/png');
            });
            if (blob) {
              await navigator.clipboard.write([
                new ClipboardItem({ 'image/png': blob }),
              ]);
              setSelection(null);
            }
          } catch (err) {
            console.error('Failed to cut image: ', err);
          }
        }
      } else if (canvasRef.current) {
        try {
          const blob = await new Promise<Blob | null>(resolve => {
            canvasRef.current!.toBlob(resolve, 'image/png');
          });
          if (blob) {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob }),
            ]);
          }
        } catch (err) {
          console.error('Failed to cut image: ', err);
        }
      }
    };

    const handleRequestCrop = () => {
      if (selection) {
        const img = selection.image || extractSelection(false);
        if (!img) return;

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = selection.w;
        tempCanvas.height = selection.h;
        const tempCtx = tempCanvas.getContext('2d');
        if (tempCtx) {
          tempCtx.fillStyle = '#ffffff';
          tempCtx.fillRect(0, 0, selection.w, selection.h);
          tempCtx.drawImage(img, 0, 0, selection.w, selection.h);

          setSelection(null);
          window.dispatchEvent(new CustomEvent('resize-canvas', { detail: { width: selection.w, height: selection.h, dataUrl: tempCanvas.toDataURL() } }));
        }
      }
    };

    const handleRequestRotate = () => {
      if (selection) {
        rotateSelection();
      } else {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const oldWidth = canvas.width;
        const oldHeight = canvas.height;
        const imgData = ctx.getImageData(0, 0, oldWidth, oldHeight);
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = oldWidth;
        tempCanvas.height = oldHeight;
        const tempCtx = tempCanvas.getContext('2d');
        if (tempCtx) {
          tempCtx.putImageData(imgData, 0, 0);

          const newWidth = oldHeight;
          const newHeight = oldWidth;
          const finalCanvas = document.createElement('canvas');
          finalCanvas.width = newWidth;
          finalCanvas.height = newHeight;
          const finalCtx = finalCanvas.getContext('2d');
          if (finalCtx) {
            finalCtx.fillStyle = '#ffffff';
            finalCtx.fillRect(0, 0, newWidth, newHeight);
            finalCtx.translate(newWidth / 2, newHeight / 2);
            finalCtx.rotate(Math.PI / 2);
            finalCtx.drawImage(tempCanvas, -oldWidth / 2, -oldHeight / 2);

            window.dispatchEvent(new CustomEvent('resize-canvas', { detail: { width: newWidth, height: newHeight, dataUrl: finalCanvas.toDataURL() } }));
          }
        }
      }
    };

    const handleRequestSelectAll = () => {
      setCurrentTool('select');
      setSelection({
        active: true,
        x: 0,
        y: 0,
        w: width,
        h: height,
        isMoving: false,
        startX: 0,
        startY: 0,
        startW: width,
        startH: height,
        isResizing: null,
        image: null,
      });
    };

    const handleClearSelection = () => {
      if (selection) {
        commitSelection();
      }
    };

    const handleRequestPaste = async () => {
      try {
        const clipboardItems = await navigator.clipboard.read();
        for (const item of clipboardItems) {
          if (item.types.some(type => type.startsWith('image/'))) {
            const blob = await item.getType(item.types.find(type => type.startsWith('image/'))!);
            const dataUrl = URL.createObjectURL(blob);
            const img = new Image();
            img.onload = () => {
              const newWidth = Math.max(img.width, width);
              const newHeight = Math.max(img.height, height);
              if (newWidth !== width || newHeight !== height) {
                window.dispatchEvent(new CustomEvent('resize-canvas', {
                  detail: { width: newWidth, height: newHeight },
                }));
              }
              setTimeout(() => {
                window.dispatchEvent(new CustomEvent('paste-image', { detail: dataUrl }));
              }, 100);
            };
            img.src = dataUrl;
            break;
          }
        }
      } catch (err) {
        console.error('Failed to paste: ', err);
      }
    };

    const handleRequestUndo = (e: Event) => {
      if (selection) {
        setSelection(null);
        const ctx = overlayCanvasRef.current?.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, width, height);

        if (!selection.image) {
          e.preventDefault();
        }
      } else if (curveState) {
        setCurveState(null);
        e.preventDefault();
      } else if (polygonState) {
        setPolygonState(null);
        e.preventDefault();
      }
    };

    const handleRequestRedo = (e: Event) => {
      if (selection || curveState || polygonState) {
        setSelection(null);
        setCurveState(null);
        setPolygonState(null);
        const ctx = overlayCanvasRef.current?.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, width, height);
        e.preventDefault();
      }
    };

    window.addEventListener('commit-selection', handleCommitSelection);
    window.addEventListener('request-copy', handleRequestCopy);
    window.addEventListener('request-cut', handleRequestCut);
    window.addEventListener('request-paste', handleRequestPaste);
    window.addEventListener('request-crop', handleRequestCrop);
    window.addEventListener('request-rotate', handleRequestRotate);
    window.addEventListener('request-select-all', handleRequestSelectAll);
    window.addEventListener('clear-selection', handleClearSelection);
    window.addEventListener('request-undo', handleRequestUndo);
    window.addEventListener('request-redo', handleRequestRedo);
    return () => {
      window.removeEventListener('commit-selection', handleCommitSelection);
      window.removeEventListener('request-copy', handleRequestCopy);
      window.removeEventListener('request-cut', handleRequestCut);
      window.removeEventListener('request-paste', handleRequestPaste);
      window.removeEventListener('request-crop', handleRequestCrop);
      window.removeEventListener('request-rotate', handleRequestRotate);
      window.removeEventListener('request-select-all', handleRequestSelectAll);
      window.removeEventListener('clear-selection', handleClearSelection);
      window.removeEventListener('request-undo', handleRequestUndo);
      window.removeEventListener('request-redo', handleRequestRedo);
    };
  }, [selection, curveState, polygonState, commitSelection, extractSelection, rotateSelection, width, height, setCurrentTool]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete') {
        const activeTag = document.activeElement?.tagName.toLowerCase();
        if (activeTag === 'input' || activeTag === 'textarea') return;

        if (selection && selection.active) {
          handleDelete();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selection, handleDelete]);

  return {
    handleCopy,
    handleCrop,
    handleCut,
    handleDelete,
    handleInvertColor,
    handleSelectAll,
  };
}
