import { DragEvent, RefObject, useEffect } from 'react';
import { Tool } from '../../../shared/types';
import { CanvasSize, CurrentFile } from './types';

interface UseImageImportParams {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  canvasSize: CanvasSize;
  historyRef: React.MutableRefObject<string[]>;
  historyStepRef: React.MutableRefObject<number>;
  setCanvasSize: (size: CanvasSize) => void;
  setCurrentFile: React.Dispatch<React.SetStateAction<CurrentFile | null>>;
  setCurrentTool: (tool: Tool) => void;
  setHasUnsavedChanges: (hasChanges: boolean) => void;
  setHistory: React.Dispatch<React.SetStateAction<string[]>>;
  setHistoryStep: React.Dispatch<React.SetStateAction<number>>;
  setPastedImage: React.Dispatch<React.SetStateAction<{ src: string; id: number } | null>>;
}

export function useImageImport({
  canvasRef,
  canvasSize,
  historyRef,
  historyStepRef,
  setCanvasSize,
  setCurrentFile,
  setCurrentTool,
  setHasUnsavedChanges,
  setHistory,
  setHistoryStep,
  setPastedImage,
}: UseImageImportParams) {
  const addPrePasteHistory = (width: number, height: number) => {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    tempCtx.fillStyle = '#ffffff';
    tempCtx.fillRect(0, 0, width, height);
    if (canvasRef.current) tempCtx.drawImage(canvasRef.current, 0, 0);

    const prePasteDataUrl = tempCanvas.toDataURL();
    const newHistory = historyRef.current.slice(0, historyStepRef.current + 1);
    newHistory.push(prePasteDataUrl);
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
    historyRef.current = newHistory;
    historyStepRef.current = newHistory.length - 1;
    setHasUnsavedChanges(true);
  };

  const importImageDataUrl = (dataUrl: string, file?: File) => {
    const img = new Image();
    img.onload = () => {
      const newWidth = Math.max(img.width, canvasSize.width);
      const newHeight = Math.max(img.height, canvasSize.height);

      addPrePasteHistory(newWidth, newHeight);

      if (newWidth !== canvasSize.width || newHeight !== canvasSize.height) {
        setCanvasSize({ width: newWidth, height: newHeight });
        setTimeout(() => {
          setPastedImage({ src: dataUrl, id: Date.now() });
          setCurrentTool('select');
        }, 50);
      } else {
        setPastedImage({ src: dataUrl, id: Date.now() });
        setCurrentTool('select');
      }

      if (file) {
        setCurrentFile({ name: file.name, size: file.size, date: new Date(file.lastModified) });
        setHasUnsavedChanges(true);
      }
    };
    img.src = dataUrl;
  };

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!e.clipboardData?.items) return;

      for (let i = 0; i < e.clipboardData.items.length; i++) {
        const item = e.clipboardData.items[i];
        if (item.type.indexOf('image') !== -1) {
          const file = item.getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => importImageDataUrl(event.target?.result as string);
            reader.readAsDataURL(file);
          }
          break;
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [canvasSize.width, canvasSize.height]);

  useEffect(() => {
    const handlePasteImage = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      importImageDataUrl(customEvent.detail);
    };

    window.addEventListener('paste-image', handlePasteImage);
    return () => window.removeEventListener('paste-image', handlePasteImage);
  }, [canvasSize.width, canvasSize.height]);

  const handleDropImage = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (event) => importImageDataUrl(event.target?.result as string, file);
    reader.readAsDataURL(file);
  };

  return { handleDropImage };
}
