import React, { useRef, useState } from 'react';
import {
  Check,
  ChevronRight,
  ClipboardPaste,
  Clock,
  Copy,
  Download,
  Expand,
  File,
  FileEdit,
  FolderOpen,
  Image as ImageIcon,
  Monitor,
  Printer,
  Redo,
  Save,
  Scissors,
  Settings,
  Share,
  Undo,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { t } from '../../../shared/i18n';

interface AppMenuBarProps {
  canPrint: boolean;
  canRedo: boolean;
  canUndo: boolean;
  showGridlines: boolean;
  showRulers: boolean;
  showStatusBar: boolean;
  showThumbnail: boolean;
  onExit: () => void;
  onNew: () => void;
  onOpen: () => void;
  onPrint: () => void;
  onRedo: () => void;
  onSave: (saveAs?: boolean) => void;
  onSetShowGridlines: (updater: (prev: boolean) => boolean) => void;
  onSetShowProperties: (show: boolean) => void;
  onSetShowRulers: (updater: (prev: boolean) => boolean) => void;
  onSetShowStatusBar: (updater: (prev: boolean) => boolean) => void;
  onSetShowThumbnail: (updater: (prev: boolean) => boolean) => void;
  onSetZoom: (updater: (prev: number) => number) => void;
  onSetWallpaper: () => void;
  onShare: () => void;
  onUndo: () => void;
}

export default function AppMenuBar({
  canPrint,
  canRedo,
  canUndo,
  showGridlines,
  showRulers,
  showStatusBar,
  showThumbnail,
  onExit,
  onNew,
  onOpen,
  onPrint,
  onRedo,
  onSave,
  onSetShowGridlines,
  onSetShowProperties,
  onSetShowRulers,
  onSetShowStatusBar,
  onSetShowThumbnail,
  onSetZoom,
  onSetWallpaper,
  onShare,
  onUndo,
}: AppMenuBarProps) {
  const [isFileMenuOpen, setIsFileMenuOpen] = useState(false);
  const [isEditMenuOpen, setIsEditMenuOpen] = useState(false);
  const [isViewMenuOpen, setIsViewMenuOpen] = useState(false);
  const fileMenuRef = useRef<HTMLButtonElement>(null);
  const editMenuRef = useRef<HTMLButtonElement>(null);
  const viewMenuRef = useRef<HTMLButtonElement>(null);

  const closeMenus = () => {
    setIsFileMenuOpen(false);
    setIsEditMenuOpen(false);
    setIsViewMenuOpen(false);
  };

  const MenuItem = ({ icon: Icon, label, shortcut, hasSubmenu, disabled, onClick }: any) => (
    <button
      className={`w-full flex items-center px-3 py-1.5 ${disabled ? 'text-gray-500' : 'hover:bg-white/10'} text-left`}
      disabled={disabled}
      onClick={() => {
        if (!hasSubmenu) closeMenus();
        if (onClick) onClick();
      }}
    >
      {Icon ? <Icon size={16} className="mr-3" strokeWidth={1.5} /> : <div className="w-4 mr-3" />}
      <span className="flex-1 text-[13px]">{label}</span>
      {shortcut && <span className="text-xs text-gray-400 ml-4">{shortcut}</span>}
      {hasSubmenu && <ChevronRight size={16} className="text-gray-400 ml-4" />}
    </button>
  );

  const MenuDivider = () => <div className="h-px bg-white/10 my-1 mx-3" />;

  return (
    <div className="h-8 w-full flex items-center px-2 text-xs gap-1 border-b border-black/40 relative z-[60] flex-shrink-0">
      <button
        ref={fileMenuRef}
        className={`px-3 py-1.5 rounded cursor-pointer transition-colors ${isFileMenuOpen ? 'bg-white/10' : 'hover:bg-white/10'}`}
        onClick={() => {
          setIsFileMenuOpen(!isFileMenuOpen);
          setIsEditMenuOpen(false);
          setIsViewMenuOpen(false);
        }}
      >
        {t('menu.file')}
      </button>
      <button
        ref={editMenuRef}
        className={`px-3 py-1.5 rounded cursor-pointer transition-colors ${isEditMenuOpen ? 'bg-white/10' : 'hover:bg-white/10'}`}
        onClick={() => {
          setIsEditMenuOpen(!isEditMenuOpen);
          setIsFileMenuOpen(false);
          setIsViewMenuOpen(false);
        }}
      >
        {t('menu.edit')}
      </button>
      <button
        ref={viewMenuRef}
        className={`px-3 py-1.5 rounded cursor-pointer transition-colors ${isViewMenuOpen ? 'bg-white/10' : 'hover:bg-white/10'}`}
        onClick={() => {
          setIsViewMenuOpen(!isViewMenuOpen);
          setIsFileMenuOpen(false);
          setIsEditMenuOpen(false);
        }}
      >
        {t('menu.view')}
      </button>

      <div className="w-px h-4 bg-white/20 mx-2" />

      <button className={`p-1.5 rounded transition-colors ${canUndo ? 'hover:bg-white/10 text-gray-300 cursor-pointer' : 'text-gray-600 cursor-default'}`} onClick={onUndo} disabled={!canUndo}>
        <Undo size={14} />
      </button>
      <button className={`p-1.5 rounded transition-colors ${canRedo ? 'hover:bg-white/10 text-gray-300 cursor-pointer' : 'text-gray-600 cursor-default'}`} onClick={onRedo} disabled={!canRedo}>
        <Redo size={14} />
      </button>

      <div className="flex-1" />

      <button className="p-1.5 hover:bg-white/10 rounded text-gray-300 mr-1" onClick={() => onSave(false)}><Download size={14} /></button>
      <button className="p-1.5 hover:bg-white/10 rounded text-gray-300 mr-2" onClick={() => onSetShowProperties(true)}><Settings size={14} /></button>

      {(isFileMenuOpen || isEditMenuOpen || isViewMenuOpen) && <div className="fixed inset-0 z-40" onClick={closeMenus} />}

      {isFileMenuOpen && fileMenuRef.current && (
        <div className="fixed bg-[#2b2b2b] border border-[#404040] rounded-md shadow-2xl z-50 py-1.5 text-gray-200" style={{ top: fileMenuRef.current.getBoundingClientRect().bottom + window.scrollY, left: fileMenuRef.current.getBoundingClientRect().left + window.scrollX }}>
          <MenuItem icon={File} label={t('action.new')} shortcut="Ctrl+N" onClick={onNew} />
          <MenuItem icon={FolderOpen} label={t('action.open')} shortcut="Ctrl+O" onClick={onOpen} />
          <MenuItem icon={Clock} label={t('action.recent')} hasSubmenu disabled />
          <MenuDivider />
          <MenuItem icon={Save} label={t('action.save')} shortcut="Ctrl+S" onClick={() => onSave(false)} />
          <MenuItem icon={FileEdit} label={t('action.saveAs')} onClick={() => onSave(true)} />
          <MenuDivider />
          <MenuItem icon={Printer} label={t('action.print')} onClick={onPrint} disabled={!canPrint} />
          <MenuItem icon={Share} label={t('action.share')} onClick={onShare} />
          <MenuDivider />
          <MenuItem icon={Monitor} label={t('action.setWallpaper')} onClick={onSetWallpaper} />
          <MenuDivider />
          <MenuItem icon={ImageIcon} label={t('action.properties')} shortcut="Ctrl+E" onClick={() => onSetShowProperties(true)} />
          <MenuDivider />
          <MenuItem icon={X} label={t('action.exit')} onClick={onExit} />
        </div>
      )}

      {isEditMenuOpen && editMenuRef.current && (
        <div className="fixed bg-[#2b2b2b] border border-[#404040] rounded-md shadow-2xl z-50 py-1.5 text-gray-200" style={{ top: editMenuRef.current.getBoundingClientRect().bottom + window.scrollY, left: editMenuRef.current.getBoundingClientRect().left + window.scrollX }}>
          <MenuItem icon={Scissors} label={t('action.cut')} shortcut="Ctrl+X" onClick={() => window.dispatchEvent(new CustomEvent('request-cut'))} />
          <MenuItem icon={Copy} label={t('action.copy')} shortcut="Ctrl+C" onClick={() => window.dispatchEvent(new CustomEvent('request-copy'))} />
          <MenuItem icon={ClipboardPaste} label={t('action.paste')} shortcut="Ctrl+V" onClick={() => window.dispatchEvent(new CustomEvent('request-paste'))} />
        </div>
      )}

      {isViewMenuOpen && viewMenuRef.current && (
        <div className="fixed bg-[#2b2b2b] border border-[#404040] rounded-md shadow-2xl z-50 py-1.5 text-gray-200" style={{ top: viewMenuRef.current.getBoundingClientRect().bottom + window.scrollY, left: viewMenuRef.current.getBoundingClientRect().left + window.scrollX }}>
          <MenuItem icon={ZoomIn} label={t('action.zoomIn')} shortcut="Ctrl++" onClick={() => onSetZoom(prev => Math.min(5, prev + 0.25))} />
          <MenuItem icon={ZoomOut} label={t('action.zoomOut')} shortcut="Ctrl+-" onClick={() => onSetZoom(prev => Math.max(0.1, prev - 0.25))} />
          <MenuDivider />
          <MenuItem icon={showRulers ? Check : undefined} label={t('action.rulers')} shortcut="Ctrl+R" onClick={() => onSetShowRulers(prev => !prev)} />
          <MenuItem icon={showGridlines ? Check : undefined} label={t('action.gridlines')} shortcut="Ctrl+G" onClick={() => onSetShowGridlines(prev => !prev)} />
          <MenuItem icon={showStatusBar ? Check : undefined} label={t('action.statusBar')} onClick={() => onSetShowStatusBar(prev => !prev)} />
          <MenuDivider />
          <MenuItem icon={Expand} label={t('action.fullscreen')} shortcut="F11" onClick={() => {
            if (!document.fullscreenElement) {
              document.documentElement.requestFullscreen().catch(err => console.log(err));
            } else {
              document.exitFullscreen().catch(err => console.log(err));
            }
          }} />
          <MenuItem icon={showThumbnail ? Check : undefined} label={t('action.thumbnail')} onClick={() => onSetShowThumbnail(prev => !prev)} />
        </div>
      )}
    </div>
  );
}
