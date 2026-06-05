import { t } from '../../../shared/i18n';
import { CurrentFile } from '../model/types';

interface ExitPromptProps {
  currentFile: CurrentFile | null;
  onCancel: () => void;
  onConfirm: (save: boolean) => void;
}

export default function ExitPrompt({ currentFile, onCancel, onConfirm }: ExitPromptProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
      <div className="bg-[#2b2b2b] border border-[#404040] rounded-lg shadow-2xl w-96 p-4 text-gray-200">
        <h2 className="text-lg font-semibold mb-2">Paint</h2>
        <p className="mb-6">{t('ui.savePrompt')} {currentFile?.name || t('ui.untitled')}?</p>
        <div className="flex justify-end gap-2 text-sm">
          <button className="px-4 py-1.5 bg-[#4cc2ff] text-black hover:bg-[#3ab0ff] rounded font-medium" onClick={() => onConfirm(true)}>{t('action.save')}</button>
          <button className="px-4 py-1.5 bg-white/10 hover:bg-white/20 rounded" onClick={() => onConfirm(false)}>{t('action.dontSave')}</button>
          <button className="px-4 py-1.5 bg-white/10 hover:bg-white/20 rounded" onClick={onCancel}>{t('ui.cancel')}</button>
        </div>
      </div>
    </div>
  );
}
