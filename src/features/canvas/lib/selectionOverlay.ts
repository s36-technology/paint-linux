import { SelectionState } from '../model/types';

const HANDLE_SIZE = 6;

export function drawSelectionOverlay(
  ctx: CanvasRenderingContext2D,
  selection: SelectionState | null,
  width: number,
  height: number,
) {
  ctx.clearRect(0, 0, width, height);
  if (!selection) return;

  if (selection.image) {
    ctx.drawImage(selection.image, selection.x, selection.y, selection.w, selection.h);
  }

  ctx.setLineDash([5, 5]);
  ctx.strokeStyle = '#0078d7';
  ctx.lineWidth = 1;

  if (selection.path && selection.path.length > 0) {
    ctx.beginPath();
    ctx.moveTo(selection.path[0].x, selection.path[0].y);
    for (let i = 1; i < selection.path.length; i++) {
      ctx.lineTo(selection.path[i].x, selection.path[i].y);
    }
    if (selection.active) {
      ctx.closePath();
    }
    ctx.stroke();
  } else {
    ctx.strokeRect(selection.x, selection.y, selection.w, selection.h);
  }

  if (selection.active) {
    drawSelectionHandles(ctx, selection);
  }

  ctx.setLineDash([]);
}

function drawSelectionHandles(ctx: CanvasRenderingContext2D, selection: SelectionState) {
  ctx.setLineDash([]);
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#0078d7';

  getSelectionHandles(selection).forEach(handle => {
    ctx.fillRect(handle.x, handle.y, HANDLE_SIZE, HANDLE_SIZE);
    ctx.strokeRect(handle.x, handle.y, HANDLE_SIZE, HANDLE_SIZE);
  });
}

function getSelectionHandles(selection: SelectionState) {
  return [
    { x: selection.x - HANDLE_SIZE / 2, y: selection.y - HANDLE_SIZE / 2 },
    { x: selection.x + selection.w / 2 - HANDLE_SIZE / 2, y: selection.y - HANDLE_SIZE / 2 },
    { x: selection.x + selection.w - HANDLE_SIZE / 2, y: selection.y - HANDLE_SIZE / 2 },
    { x: selection.x - HANDLE_SIZE / 2, y: selection.y + selection.h / 2 - HANDLE_SIZE / 2 },
    { x: selection.x + selection.w - HANDLE_SIZE / 2, y: selection.y + selection.h / 2 - HANDLE_SIZE / 2 },
    { x: selection.x - HANDLE_SIZE / 2, y: selection.y + selection.h - HANDLE_SIZE / 2 },
    { x: selection.x + selection.w / 2 - HANDLE_SIZE / 2, y: selection.y + selection.h - HANDLE_SIZE / 2 },
    { x: selection.x + selection.w - HANDLE_SIZE / 2, y: selection.y + selection.h - HANDLE_SIZE / 2 },
  ];
}
