import { t } from '../../../shared/i18n';
import { CanvasSize, CurrentFile } from '../model/types';

interface PropertiesDialogProps {
  canvasSize: CanvasSize;
  currentFile: CurrentFile | null;
  onCancel: () => void;
  onApply: (width: number, height: number, scaleContent: boolean) => void;
}

export default function PropertiesDialog({ canvasSize, currentFile, onCancel, onApply }: PropertiesDialogProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
      <div className="bg-[#2b2b2b] border border-[#404040] rounded-lg shadow-2xl w-80 p-4 text-gray-200">
        <h2 className="text-lg font-semibold mb-4">{t('action.properties')}</h2>
        <div className="space-y-4 text-sm">
          <div>
            <p><span className="text-gray-400">{t('ui.fileName')}:</span> {currentFile?.name || t('ui.untitled')}</p>
            <p><span className="text-gray-400">{t('ui.dateModified')}:</span> {currentFile?.date ? new Date(currentFile.date).toLocaleString() : 'N/A'}</p>
            <p><span className="text-gray-400">{t('ui.size')}:</span> {currentFile?.size ? (currentFile.size / 1024).toFixed(2) + ' KB' : 'N/A'}</p>
          </div>
          <div>
            <p className="text-gray-400 mb-2">{t('ui.resolution')}:</p>
            <div className="flex items-center gap-2">
              <input type="number" className="w-20 bg-[#1e1e1e] border border-[#404040] rounded px-2 py-1" defaultValue={canvasSize.width} id="prop-width" />
              <span>x</span>
              <input type="number" className="w-20 bg-[#1e1e1e] border border-[#404040] rounded px-2 py-1" defaultValue={canvasSize.height} id="prop-height" />
              <span>px</span>
            </div>
          </div>
          <label className="flex items-center gap-2 mt-4 cursor-pointer">
            <input type="checkbox" id="prop-scale" className="w-4 h-4 rounded border-gray-500 bg-transparent text-[#4cc2ff]" />
            <span>{t('action.scaleContent')}</span>
          </label>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button
            className="px-4 py-1.5 bg-[#4cc2ff] text-black hover:bg-[#3ab0ff] rounded font-medium"
            onClick={() => {
              const width = parseInt((document.getElementById('prop-width') as HTMLInputElement).value);
              const height = parseInt((document.getElementById('prop-height') as HTMLInputElement).value);
              const scale = (document.getElementById('prop-scale') as HTMLInputElement)?.checked;
              onApply(width, height, scale);
            }}
          >
            {t('ui.ok')}
          </button>
          <button className="px-4 py-1.5 bg-white/10 hover:bg-white/20 rounded" onClick={onCancel}>{t('ui.cancel')}</button>
        </div>
      </div>
    </div>
  );
}
