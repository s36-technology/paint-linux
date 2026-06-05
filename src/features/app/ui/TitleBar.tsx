import { Minus, Square, X } from 'lucide-react';
import { t } from '../../../shared/i18n';
import { CurrentFile } from '../model/types';

interface TitleBarProps {
  currentFile: CurrentFile | null;
  hasUnsavedChanges: boolean;
  onExit: () => void;
}

export default function TitleBar({ currentFile, hasUnsavedChanges, onExit }: TitleBarProps) {
  return (
    <div className="h-10 w-full flex items-center justify-between px-3 flex-shrink-0" style={{ WebkitAppRegion: 'drag' } as any}>
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="w-4 h-4 rounded-sm bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
          <div className="w-2 h-2 bg-white rounded-full opacity-80" />
        </div>
        <span className="text-xs font-medium text-gray-200 truncate">
          {currentFile?.name || t('ui.untitled')} - Paint {hasUnsavedChanges && '*'}
        </span>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0" style={{ WebkitAppRegion: 'no-drag' } as any}>
        <div className="flex items-center gap-3 text-gray-400">
          <Minus size={16} className="cursor-pointer hover:text-white flex-shrink-0" onClick={() => window.electronAPI?.windowControl('minimize')} />
          <Square size={14} className="cursor-pointer hover:text-white flex-shrink-0" onClick={() => window.electronAPI?.windowControl('maximize')} />
          <X size={16} className="cursor-pointer hover:text-white flex-shrink-0" onClick={onExit} />
        </div>
      </div>
    </div>
  );
}
