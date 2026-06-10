import { useState, useEffect, useRef } from 'react';
import Toolbar from './features/toolbar/ui/Toolbar';
import { Tool } from './shared/types';
import AppMenuBar from './features/app/ui/AppMenuBar';
import ExitPrompt from './features/app/ui/ExitPrompt';
import PropertiesDialog from './features/app/ui/PropertiesDialog';
import StatusBar from './features/app/ui/StatusBar';
import CanvasWorkspace from './features/app/ui/CanvasWorkspace';
import TitleBar from './features/app/ui/TitleBar';
import { CurrentFile } from './features/app/model/types';
import { useImageImport } from './features/app/model/useImageImport';
import { TextBackgroundMode } from './features/canvas/model/types';

export default function App() {
  const [currentTool, setCurrentTool] = useState<Tool>('pencil');
  const [primaryColor, setPrimaryColor] = useState<string>('#000000');
  const [secondaryColor, setSecondaryColor] = useState<string>('#ffffff');
  const [strokeSize, setStrokeSize] = useState<number>(3);
  const [textBackgroundMode, setTextBackgroundMode] = useState<TextBackgroundMode>('transparent');
  const [shapeBackgroundMode, setShapeBackgroundMode] = useState<TextBackgroundMode>('transparent');
  const [canvasSize, setCanvasSize] = useState({ width: 1536, height: 960 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [currentFile, setCurrentFile] = useState<CurrentFile | null>(null);
  const [printers, setPrinters] = useState<any[]>([]);
  const [showExitPrompt, setShowExitPrompt] = useState(false);
  const [showProperties, setShowProperties] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyStep, setHistoryStep] = useState<number>(-1);
  const historyRef = useRef(history);
  const historyStepRef = useRef(historyStep);

  useEffect(() => {
    historyRef.current = history;
    historyStepRef.current = historyStep;
  }, [history, historyStep]);
  const [zoom, setZoom] = useState<number>(1);
  const [isResizingCanvas, setIsResizingCanvas] = useState<'e' | 's' | 'se' | 'w' | 'n' | 'nw' | 'sw' | 'ne' | null>(null);
  const [resizeStart, setResizeStart] = useState<{x: number, y: number, w: number, h: number} | null>(null);
  const [liveResizeBox, setLiveResizeBox] = useState<{w: number, h: number, x: number, y: number} | null>(null);
  const [pastedImage, setPastedImage] = useState<{src: string, id: number} | null>(null);
  const [mousePos, setMousePos] = useState<{x: number, y: number} | null>(null);
  const [showRulers, setShowRulers] = useState(false);
  const [showGridlines, setShowGridlines] = useState(false);
  const [showStatusBar, setShowStatusBar] = useState(true);
  const [showThumbnail, setShowThumbnail] = useState(false);
  const [thumbnailPos, setThumbnailPos] = useState({ x: 16, y: 16 });
  const [isDraggingThumbnail, setIsDraggingThumbnail] = useState(false);
  const [thumbnailDragStart, setThumbnailDragStart] = useState({ x: 0, y: 0 });

  const { handleDropImage } = useImageImport({
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
  });

  useEffect(() => {
    const container = canvasContainerRef.current;
    if (!container) return;
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        setZoom(prev => Math.max(0.1, Math.min(5, prev + delta)));
      }
    };
    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  // Initialize history with blank canvas or restore on resize
  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        if (historyRef.current.length === 0) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);
          const dataUrl = canvasRef.current.toDataURL();
          setHistory([dataUrl]);
          setHistoryStep(0);
          historyRef.current = [dataUrl];
          historyStepRef.current = 0;
        } else if (historyStepRef.current >= 0) {
          // Restore the current history step when canvas resizes
          const img = new Image();
          img.onload = () => {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);
            ctx.drawImage(img, 0, 0);
          };
          img.src = historyRef.current[historyStepRef.current];
        }
      }
    }
  }, [canvasSize]);

  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.getPrinters().then(p => setPrinters(p));
      
      window.electronAPI.onCloseRequested(() => {
        handleExit();
      });
      
      return () => {
        window.electronAPI?.offCloseRequested();
      };
    }
  }, [hasUnsavedChanges]);



  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.code === 'KeyN') { e.preventDefault(); handleNew(); }
      if (e.ctrlKey && e.code === 'KeyO') { e.preventDefault(); handleOpen(); }
      if (e.ctrlKey && e.code === 'KeyS') { e.preventDefault(); handleSave(false); }
      if (e.ctrlKey && e.code === 'KeyE') { e.preventDefault(); setShowProperties(true); }
      if (e.ctrlKey && e.code === 'KeyA') { e.preventDefault(); window.dispatchEvent(new CustomEvent('request-select-all')); }
      if (e.ctrlKey && e.code === 'KeyC') { e.preventDefault(); window.dispatchEvent(new CustomEvent('request-copy')); }
      if (e.ctrlKey && e.code === 'KeyX') { e.preventDefault(); window.dispatchEvent(new CustomEvent('request-cut')); }
      if (e.ctrlKey && e.code === 'KeyV') { e.preventDefault(); window.dispatchEvent(new CustomEvent('request-paste')); }
      if (e.ctrlKey && e.code === 'KeyQ') { e.preventDefault(); handleExit(); }
      if (e.ctrlKey && e.code === 'KeyW') { e.preventDefault(); window.dispatchEvent(new CustomEvent('clear-selection')); }
      if (e.ctrlKey && e.shiftKey && e.code === 'KeyX') { e.preventDefault(); window.dispatchEvent(new CustomEvent('request-crop')); }
      if (e.ctrlKey && e.code === 'KeyR') { e.preventDefault(); setShowRulers(prev => !prev); }
      if (e.ctrlKey && e.code === 'KeyG') { e.preventDefault(); setShowGridlines(prev => !prev); }
      if (e.code === 'F11') {
        e.preventDefault();
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(err => console.log(err));
        } else {
          document.exitFullscreen().catch(err => console.log(err));
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentFile, hasUnsavedChanges]);

  useEffect(() => {
    const handleZoomIn = () => setZoom(prev => Math.min(5, prev + 0.25));
    const handleZoomOut = () => setZoom(prev => Math.max(0.1, prev - 0.25));
    const handleResize = () => setShowProperties(true);
    const handleResizeCanvas = (e: any) => {
      if (e.detail && e.detail.width && e.detail.height) {
        setCanvasSize({ width: e.detail.width, height: e.detail.height });
        if (e.detail.dataUrl) {
          const newHistory = historyRef.current.slice(0, historyStepRef.current + 1);
          newHistory.push(e.detail.dataUrl);
          setHistory(newHistory);
          setHistoryStep(newHistory.length - 1);
          setHasUnsavedChanges(true);
          historyRef.current = newHistory;
          historyStepRef.current = newHistory.length - 1;
        }
      }
    };

    window.addEventListener('request-zoom-in', handleZoomIn);
    window.addEventListener('request-zoom-out', handleZoomOut);
    window.addEventListener('request-resize', handleResize);
    window.addEventListener('resize-canvas', handleResizeCanvas);
    
    return () => {
      window.removeEventListener('request-zoom-in', handleZoomIn);
      window.removeEventListener('request-zoom-out', handleZoomOut);
      window.removeEventListener('request-resize', handleResize);
      window.removeEventListener('resize-canvas', handleResizeCanvas);
    };
  }, []);

  useEffect(() => {
    if (!isResizingCanvas || !resizeStart) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = (e.clientX - resizeStart.x) / zoom;
      const dy = (e.clientY - resizeStart.y) / zoom;
      
      let w = resizeStart.w;
      let h = resizeStart.h;
      let x = 0;
      let y = 0;

      if (isResizingCanvas.includes('e')) {
        w = Math.max(10, resizeStart.w + dx);
      }
      if (isResizingCanvas.includes('s')) {
        h = Math.max(10, resizeStart.h + dy);
      }
      if (isResizingCanvas.includes('w')) {
        const newW = Math.max(10, resizeStart.w - dx);
        x = resizeStart.w - newW;
        w = newW;
      }
      if (isResizingCanvas.includes('n')) {
        const newH = Math.max(10, resizeStart.h - dy);
        y = resizeStart.h - newH;
        h = newH;
      }

      setLiveResizeBox({ w: Math.round(w), h: Math.round(h), x: Math.round(x), y: Math.round(y) });
    };

    const handleMouseUp = () => {
      setIsResizingCanvas(null);
      setResizeStart(null);
      
      setLiveResizeBox(prev => {
        if (prev && (prev.w !== resizeStart.w || prev.h !== resizeStart.h)) {
           const img = new Image();
           img.onload = () => {
             const tempCanvas = document.createElement('canvas');
             tempCanvas.width = prev.w;
             tempCanvas.height = prev.h;
             const ctx = tempCanvas.getContext('2d');
             if (ctx) {
               ctx.fillStyle = '#ffffff';
               ctx.fillRect(0, 0, prev.w, prev.h);
               ctx.drawImage(img, -prev.x, -prev.y);
               const dataUrl = tempCanvas.toDataURL();
               
               const newHistory = historyRef.current.slice(0, historyStepRef.current + 1);
               newHistory.push(dataUrl);
               setHistory(newHistory);
               setHistoryStep(newHistory.length - 1);
               setHasUnsavedChanges(true);
               historyRef.current = newHistory;
               historyStepRef.current = newHistory.length - 1;
               
               setCanvasSize({ width: prev.w, height: prev.h });
               
               // Adjust scroll to counteract top/left shifts visually
               if (canvasContainerRef.current) {
                 if (prev.x < 0) {
                   canvasContainerRef.current.scrollLeft += Math.abs(prev.x);
                 }
                 if (prev.y < 0) {
                   canvasContainerRef.current.scrollTop += Math.abs(prev.y);
                 }
               }
             }
           };
           img.src = historyRef.current[historyStepRef.current] || canvasRef.current!.toDataURL();
        }
        return null;
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizingCanvas, resizeStart, zoom]);

  const handleDraw = (dataUrl?: string) => {
    setHasUnsavedChanges(true);
    if (dataUrl) {
      const newHistory = history.slice(0, historyStep + 1);
      newHistory.push(dataUrl);
      setHistory(newHistory);
      setHistoryStep(newHistory.length - 1);
      historyRef.current = newHistory;
      historyStepRef.current = newHistory.length - 1;
    }
  };

  const handleUndo = () => {
    const e = new CustomEvent('request-undo', { cancelable: true });
    window.dispatchEvent(e);
    if (e.defaultPrevented) return;
    
    if (historyStep > 0) {
      const newStep = historyStep - 1;
      setHistoryStep(newStep);
      historyStepRef.current = newStep;
      restoreCanvas(history[newStep]);
    }
  };

  const handleRedo = () => {
    const e = new CustomEvent('request-redo', { cancelable: true });
    window.dispatchEvent(e);
    if (e.defaultPrevented) return;
    
    if (historyStep < history.length - 1) {
      const newStep = historyStep + 1;
      setHistoryStep(newStep);
      historyStepRef.current = newStep;
      restoreCanvas(history[newStep]);
    }
  };

  useEffect(() => {
    const handleUndoRedoKeys = (e: KeyboardEvent) => {
      if (e.ctrlKey && !e.shiftKey && e.code === 'KeyZ') {
        e.preventDefault();
        handleUndo();
      }
      if ((e.ctrlKey && e.code === 'KeyY') || (e.ctrlKey && e.shiftKey && e.code === 'KeyZ')) {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleUndoRedoKeys);
    return () => window.removeEventListener('keydown', handleUndoRedoKeys);
  }, [history, historyStep]);

  const restoreCanvas = (dataUrl: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const img = new Image();
    img.onload = () => {
      if (img.width !== canvasSize.width || img.height !== canvasSize.height) {
        setCanvasSize({ width: img.width, height: img.height });
      } else {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      }
    };
    img.src = dataUrl;
  };

  const handleNew = () => {
    if (window.electronAPI) window.electronAPI.newWindow();
  };

  const handleOpen = async () => {
    if (window.electronAPI) {
      const file = await window.electronAPI.openFile();
      if (file) {
        const img = new Image();
        img.onload = () => {
          const newWidth = img.width;
          const newHeight = img.height;
          
          const offCanvas = document.createElement('canvas');
          offCanvas.width = newWidth;
          offCanvas.height = newHeight;
          const offCtx = offCanvas.getContext('2d');
          if (offCtx) {
            offCtx.fillStyle = '#ffffff';
            offCtx.fillRect(0, 0, newWidth, newHeight);
            offCtx.drawImage(img, 0, 0);
            
            const newDataUrl = offCanvas.toDataURL();
            setHistory([newDataUrl]);
            setHistoryStep(0);
            setCanvasSize({ width: newWidth, height: newHeight });
          }
          
          setCurrentFile(file);
          setHasUnsavedChanges(false);
        };
        img.src = file.dataUrl;
      }
    }
  };

  const handleSave = async (saveAs = false) => {
    window.dispatchEvent(new Event('commit-selection'));
    if (window.electronAPI && canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      const defaultPath = !saveAs && currentFile?.path ? currentFile.path : (currentFile?.name || 'Untitled.png');
      const savedPath = await window.electronAPI.saveFile({ dataUrl, defaultPath });
      if (savedPath) {
        setCurrentFile(prev => ({ ...prev, name: savedPath.split('/').pop() || 'Untitled.png', path: savedPath }));
        setHasUnsavedChanges(false);
      }
    } else if (canvasRef.current) {
      // Fallback for browser environment
      const dataUrl = canvasRef.current.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = currentFile?.name || 'Untitled.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setHasUnsavedChanges(false);
    }
  };

  const handlePrint = async () => {
    if (window.electronAPI && printers.length > 0) {
      await window.electronAPI.print();
    }
  };

  const handleShare = async () => {
    window.dispatchEvent(new Event('commit-selection'));
    if (window.electronAPI && canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      await window.electronAPI.share(dataUrl);
    }
  };

  const handleSetWallpaper = async () => {
    window.dispatchEvent(new Event('commit-selection'));
    if (window.electronAPI && canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      await window.electronAPI.setWallpaper(dataUrl);
    }
  };

  const handleExit = () => {
    if (hasUnsavedChanges) {
      setShowExitPrompt(true);
    } else {
      if (window.electronAPI) window.electronAPI.exit(true);
    }
  };

  const confirmExit = async (save: boolean) => {
    if (save) {
      await handleSave(false);
    }
    if (window.electronAPI) window.electronAPI.exit(true);
  };




  return (
    <div className="flex flex-col h-screen bg-[#202020] text-gray-300 font-sans select-none overflow-auto">

      <TitleBar
        currentFile={currentFile}
        hasUnsavedChanges={hasUnsavedChanges}
        onExit={handleExit}
      />

      <AppMenuBar
        canPrint={printers.length > 0}
        canRedo={historyStep < history.length - 1}
        canUndo={historyStep > 0}
        showGridlines={showGridlines}
        showRulers={showRulers}
        showStatusBar={showStatusBar}
        showThumbnail={showThumbnail}
        onExit={handleExit}
        onNew={handleNew}
        onOpen={handleOpen}
        onPrint={handlePrint}
        onRedo={handleRedo}
        onSave={handleSave}
        onSetShowGridlines={setShowGridlines}
        onSetShowProperties={setShowProperties}
        onSetShowRulers={setShowRulers}
        onSetShowStatusBar={setShowStatusBar}
        onSetShowThumbnail={setShowThumbnail}
        onSetZoom={setZoom}
        onSetWallpaper={handleSetWallpaper}
        onShare={handleShare}
        onUndo={handleUndo}
      />

      {/* Ribbon / Toolbar */}
      <Toolbar
        currentTool={currentTool}
        setCurrentTool={setCurrentTool}
        primaryColor={primaryColor}
        setPrimaryColor={setPrimaryColor}
        secondaryColor={secondaryColor}
        setSecondaryColor={setSecondaryColor}
        strokeSize={strokeSize}
        setStrokeSize={setStrokeSize}
        textBackgroundMode={textBackgroundMode}
        setTextBackgroundMode={setTextBackgroundMode}
        shapeBackgroundMode={shapeBackgroundMode}
        setShapeBackgroundMode={setShapeBackgroundMode}
      />

      <CanvasWorkspace
        canvasContainerRef={canvasContainerRef}
        canvasRef={canvasRef}
        canvasSize={canvasSize}
        currentTool={currentTool}
        history={history}
        historyStep={historyStep}
        isDraggingThumbnail={isDraggingThumbnail}
        liveResizeBox={liveResizeBox}
        pastedImage={pastedImage}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
        textBackgroundMode={textBackgroundMode}
        shapeBackgroundMode={shapeBackgroundMode}
        showGridlines={showGridlines}
        showRulers={showRulers}
        showThumbnail={showThumbnail}
        strokeSize={strokeSize}
        thumbnailDragStart={thumbnailDragStart}
        thumbnailPos={thumbnailPos}
        zoom={zoom}
        onColorPick={(color, isSecondary) => {
          if (isSecondary) setSecondaryColor(color);
          else setPrimaryColor(color);
          window.dispatchEvent(new CustomEvent('add-custom-color', { detail: color }));
        }}
        onDropImage={handleDropImage}
        onDraw={handleDraw}
        onMousePosChange={setMousePos}
        onResizeStartChange={setResizeStart}
        onSetCurrentTool={setCurrentTool}
        onSetIsDraggingThumbnail={setIsDraggingThumbnail}
        onSetIsResizingCanvas={setIsResizingCanvas}
        onSetStrokeSize={setStrokeSize}
        onSetThumbnailDragStart={setThumbnailDragStart}
        onSetThumbnailPos={setThumbnailPos}
        onSetShowThumbnail={setShowThumbnail}
      />

      {showStatusBar && (
        <StatusBar
          canvasSize={canvasSize}
          mousePos={mousePos}
          zoom={zoom}
          onZoomChange={setZoom}
        />
      )}

      {/* Modals */}
      {showProperties && (
        <PropertiesDialog
          canvasSize={canvasSize}
          currentFile={currentFile}
          onCancel={() => setShowProperties(false)}
          onApply={(w, h, scale) => {
            if (w > 0 && h > 0) {
              if (scale && historyStepRef.current >= 0) {
                const img = new Image();
                img.onload = () => {
                  const tempCanvas = document.createElement('canvas');
                  tempCanvas.width = w;
                  tempCanvas.height = h;
                  const tCtx = tempCanvas.getContext('2d');
                  if (tCtx) {
                    tCtx.fillStyle = '#ffffff';
                    tCtx.fillRect(0, 0, w, h);
                    tCtx.drawImage(img, 0, 0, w, h);
                    const dataUrl = tempCanvas.toDataURL();
                    const newHistory = historyRef.current.slice(0, historyStepRef.current + 1);
                    newHistory.push(dataUrl);
                    setHistory(newHistory);
                    setHistoryStep(newHistory.length - 1);
                    historyRef.current = newHistory;
                    historyStepRef.current = newHistory.length - 1;
                    setCanvasSize({ width: w, height: h });
                  }
                };
                img.src = historyRef.current[historyStepRef.current];
              } else {
                setCanvasSize({ width: w, height: h });
              }
            }
            setShowProperties(false);
          }}
        />
      )}

      {showExitPrompt && (
        <ExitPrompt
          currentFile={currentFile}
          onCancel={() => setShowExitPrompt(false)}
          onConfirm={confirmExit}
        />
      )}

    </div>
  );
}
