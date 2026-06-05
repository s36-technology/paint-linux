import { Tool } from '../../../shared/types';

export function getCanvasCursor(tool: Tool, isSelectionMoving?: boolean) {
  if (tool === 'select' || tool === 'lasso-select') return isSelectionMoving ? 'move' : 'crosshair';

  switch (tool) {
    case 'text':
      return 'text';
    case 'eraser':
      return 'cell';
    case 'fill':
      return 'alias';
    case 'pencil':
    case 'brush':
    case 'picker':
    default:
      return 'crosshair';
  }
}
