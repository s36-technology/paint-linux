import { Tool } from '../../../shared/types';
import { Point, TextBackgroundMode } from '../model/types';

const BRUSH_TOOLS: Tool[] = [
  'pencil',
  'brush',
  'eraser',
  'calligraphy',
  'pen',
  'airbrush',
  'oil',
  'crayon',
  'marker',
  'texture',
  'watercolor',
];

const SHAPE_TOOLS: Tool[] = [
  'rectangle',
  'circle',
  'line',
  'arrow',
  'rounded-rectangle',
  'triangle',
  'right-triangle',
  'diamond',
  'pentagon',
  'hexagon',
  'arrow-right',
  'arrow-left',
  'arrow-up',
  'arrow-down',
  'star-4',
  'star-5',
  'star-6',
  'callout-rounded',
  'callout-oval',
  'callout-cloud',
  'heart',
  'lightning',
];

export function isBrushTool(tool: Tool) {
  return BRUSH_TOOLS.includes(tool);
}

export function isShapeTool(tool: Tool) {
  return SHAPE_TOOLS.includes(tool);
}

export function applyBrushStroke(
  ctx: CanvasRenderingContext2D,
  tool: Tool,
  point: Point,
  primaryColor: string,
  secondaryColor: string,
  strokeSize: number,
) {
  ctx.lineTo(point.x, point.y);
  ctx.strokeStyle = tool === 'eraser' ? secondaryColor : primaryColor;
  ctx.lineWidth = strokeSize;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.globalAlpha = 1.0;

  if (tool === 'brush') {
    ctx.lineWidth = strokeSize * 3;
  } else if (tool === 'calligraphy') {
    ctx.lineWidth = strokeSize * 2;
    ctx.lineCap = 'square';
  } else if (tool === 'marker') {
    ctx.lineWidth = strokeSize * 4;
    ctx.globalAlpha = 0.5;
    ctx.lineCap = 'square';
  } else if (tool === 'watercolor') {
    ctx.lineWidth = strokeSize * 5;
    ctx.globalAlpha = 0.1;
  } else if (tool === 'airbrush') {
    ctx.lineWidth = strokeSize * 4;
    ctx.shadowBlur = strokeSize * 2;
    ctx.shadowColor = primaryColor;
  } else if (tool === 'oil') {
    ctx.lineWidth = strokeSize * 3;
    ctx.globalAlpha = 0.8;
  } else if (tool === 'crayon' || tool === 'texture') {
    ctx.lineWidth = strokeSize * 2;
    ctx.globalAlpha = 0.7;
  }

  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1.0;
}

export function drawShapePreview(
  ctx: CanvasRenderingContext2D,
  tool: Tool,
  startPos: Point,
  currentPos: Point,
  strokeSize: number,
  primaryColor: string,
  backgroundMode: TextBackgroundMode,
  backgroundColor: string,
  shiftKey: boolean,
) {
  ctx.beginPath();
  ctx.strokeStyle = primaryColor;
  ctx.fillStyle = backgroundColor;
  ctx.lineWidth = strokeSize;

  let w = currentPos.x - startPos.x;
  let h = currentPos.y - startPos.y;

  if (shiftKey) {
    const size = Math.max(Math.abs(w), Math.abs(h));
    w = w < 0 ? -size : size;
    h = h < 0 ? -size : size;
    if (tool === 'line') {
      const angle = Math.atan2(currentPos.y - startPos.y, currentPos.x - startPos.x);
      const snappedAngle = Math.round(angle / (Math.PI / 4)) * (Math.PI / 4);
      const length = Math.sqrt(Math.pow(currentPos.x - startPos.x, 2) + Math.pow(currentPos.y - startPos.y, 2));
      w = Math.cos(snappedAngle) * length;
      h = Math.sin(snappedAngle) * length;
    }
  }

  const drawX = startPos.x;
  const drawY = startPos.y;

  switch (tool) {
    case 'line':
      ctx.moveTo(drawX, drawY);
      ctx.lineTo(drawX + w, drawY + h);
      break;
    case 'arrow':
      drawArrowLine(ctx, drawX, drawY, drawX + w, drawY + h, strokeSize);
      break;
    case 'rectangle':
      ctx.rect(drawX, drawY, w, h);
      break;
    case 'circle':
      ctx.ellipse(drawX + w / 2, drawY + h / 2, Math.abs(w / 2), Math.abs(h / 2), 0, 0, 2 * Math.PI);
      break;
    case 'rounded-rectangle':
      ctx.roundRect(Math.min(drawX, drawX + w), Math.min(drawY, drawY + h), Math.abs(w), Math.abs(h), Math.min(Math.abs(w), Math.abs(h)) * 0.1);
      break;
    case 'triangle':
      ctx.moveTo(drawX + w / 2, drawY);
      ctx.lineTo(drawX + w, drawY + h);
      ctx.lineTo(drawX, drawY + h);
      ctx.closePath();
      break;
    case 'right-triangle':
      ctx.moveTo(drawX, drawY);
      ctx.lineTo(drawX, drawY + h);
      ctx.lineTo(drawX + w, drawY + h);
      ctx.closePath();
      break;
    case 'diamond':
      ctx.moveTo(drawX + w / 2, drawY);
      ctx.lineTo(drawX + w, drawY + h / 2);
      ctx.lineTo(drawX + w / 2, drawY + h);
      ctx.lineTo(drawX, drawY + h / 2);
      ctx.closePath();
      break;
    case 'pentagon':
    case 'hexagon':
      drawRegularPolygon(ctx, drawX, drawY, w, h, tool === 'pentagon' ? 5 : 6);
      break;
    case 'star-4':
    case 'star-5':
    case 'star-6':
      drawStar(ctx, drawX, drawY, w, h, tool === 'star-4' ? 4 : tool === 'star-5' ? 5 : 6);
      break;
    case 'arrow-right':
      drawArrowRight(ctx, drawX, drawY, w, h);
      break;
    case 'arrow-left':
      drawArrowLeft(ctx, drawX, drawY, w, h);
      break;
    case 'arrow-up':
      drawArrowUp(ctx, drawX, drawY, w, h);
      break;
    case 'arrow-down':
      drawArrowDown(ctx, drawX, drawY, w, h);
      break;
    case 'heart':
      drawHeart(ctx, drawX, drawY, w, h);
      break;
    case 'lightning':
      drawLightning(ctx, drawX, drawY, w, h);
      break;
    case 'callout-rounded':
      drawRoundedCallout(ctx, drawX, drawY, w, h);
      break;
    case 'callout-oval':
      drawOvalCallout(ctx, drawX, drawY, w, h);
      break;
    case 'callout-cloud':
      drawCloudCallout(ctx, drawX, drawY, w, h);
      break;
  }

  if (backgroundMode === 'color' && isFillableShape(tool)) {
    ctx.fill();
  }
  ctx.stroke();
}

function isFillableShape(tool: Tool) {
  return tool !== 'line' && tool !== 'arrow';
}

function drawArrowLine(ctx: CanvasRenderingContext2D, startX: number, startY: number, endX: number, endY: number, strokeSize: number) {
  const angle = Math.atan2(endY - startY, endX - startX);
  const length = Math.hypot(endX - startX, endY - startY);
  const headLength = Math.min(Math.max(strokeSize * 5, 12), Math.max(length * 0.45, 1));

  ctx.moveTo(startX, startY);
  ctx.lineTo(endX, endY);

  if (length < 2) return;

  ctx.moveTo(endX, endY);
  ctx.lineTo(
    endX - headLength * Math.cos(angle - Math.PI / 6),
    endY - headLength * Math.sin(angle - Math.PI / 6),
  );
  ctx.moveTo(endX, endY);
  ctx.lineTo(
    endX - headLength * Math.cos(angle + Math.PI / 6),
    endY - headLength * Math.sin(angle + Math.PI / 6),
  );
}

function drawRegularPolygon(ctx: CanvasRenderingContext2D, drawX: number, drawY: number, w: number, h: number, points: number) {
  for (let i = 0; i < points; i++) {
    const angle = (i * 2 * Math.PI / points) - Math.PI / 2;
    const px = drawX + w / 2 + (Math.abs(w) / 2) * Math.cos(angle);
    const py = drawY + h / 2 + (Math.abs(h) / 2) * Math.sin(angle);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

function drawStar(ctx: CanvasRenderingContext2D, drawX: number, drawY: number, w: number, h: number, points: number) {
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? 1 : 0.4;
    const angle = (i * Math.PI / points) - Math.PI / 2;
    const px = drawX + w / 2 + (Math.abs(w) / 2) * r * Math.cos(angle);
    const py = drawY + h / 2 + (Math.abs(h) / 2) * r * Math.sin(angle);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

function drawArrowRight(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.moveTo(x, y + h * 0.25);
  ctx.lineTo(x + w * 0.5, y + h * 0.25);
  ctx.lineTo(x + w * 0.5, y);
  ctx.lineTo(x + w, y + h * 0.5);
  ctx.lineTo(x + w * 0.5, y + h);
  ctx.lineTo(x + w * 0.5, y + h * 0.75);
  ctx.lineTo(x, y + h * 0.75);
  ctx.closePath();
}

function drawArrowLeft(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.moveTo(x + w, y + h * 0.25);
  ctx.lineTo(x + w * 0.5, y + h * 0.25);
  ctx.lineTo(x + w * 0.5, y);
  ctx.lineTo(x, y + h * 0.5);
  ctx.lineTo(x + w * 0.5, y + h);
  ctx.lineTo(x + w * 0.5, y + h * 0.75);
  ctx.lineTo(x + w, y + h * 0.75);
  ctx.closePath();
}

function drawArrowUp(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.moveTo(x + w * 0.25, y + h);
  ctx.lineTo(x + w * 0.25, y + h * 0.5);
  ctx.lineTo(x, y + h * 0.5);
  ctx.lineTo(x + w * 0.5, y);
  ctx.lineTo(x + w, y + h * 0.5);
  ctx.lineTo(x + w * 0.75, y + h * 0.5);
  ctx.lineTo(x + w * 0.75, y + h);
  ctx.closePath();
}

function drawArrowDown(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.moveTo(x + w * 0.25, y);
  ctx.lineTo(x + w * 0.25, y + h * 0.5);
  ctx.lineTo(x, y + h * 0.5);
  ctx.lineTo(x + w * 0.5, y + h);
  ctx.lineTo(x + w, y + h * 0.5);
  ctx.lineTo(x + w * 0.75, y + h * 0.5);
  ctx.lineTo(x + w * 0.75, y);
  ctx.closePath();
}

function drawHeart(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  const topCurveHeight = h * 0.3;
  ctx.moveTo(x + w / 2, y + topCurveHeight);
  ctx.bezierCurveTo(x + w / 2, y, x, y, x, y + topCurveHeight);
  ctx.bezierCurveTo(x, y + (h + topCurveHeight) / 2, x + w / 2, y + h, x + w / 2, y + h);
  ctx.bezierCurveTo(x + w / 2, y + h, x + w, y + (h + topCurveHeight) / 2, x + w, y + topCurveHeight);
  ctx.bezierCurveTo(x + w, y, x + w / 2, y, x + w / 2, y + topCurveHeight);
  ctx.closePath();
}

function drawLightning(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.moveTo(x + w * 0.5, y);
  ctx.lineTo(x, y + h * 0.6);
  ctx.lineTo(x + w * 0.4, y + h * 0.6);
  ctx.lineTo(x + w * 0.3, y + h);
  ctx.lineTo(x + w, y + h * 0.4);
  ctx.lineTo(x + w * 0.6, y + h * 0.4);
  ctx.closePath();
}

function drawRoundedCallout(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  const radius = Math.min(Math.abs(w), Math.abs(h)) * 0.1;
  const tailH = h * 0.2;
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - tailH - radius);
  ctx.quadraticCurveTo(x + w, y + h - tailH, x + w - radius, y + h - tailH);
  ctx.lineTo(x + w * 0.6, y + h - tailH);
  ctx.lineTo(x + w * 0.4, y + h);
  ctx.lineTo(x + w * 0.4, y + h - tailH);
  ctx.lineTo(x + radius, y + h - tailH);
  ctx.quadraticCurveTo(x, y + h - tailH, x, y + h - tailH - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function drawOvalCallout(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  const ovalTailH = h * 0.2;
  const ovalH = h - ovalTailH;
  const kappa = 0.5522848;
  const ox = (w / 2) * kappa;
  const oy = (ovalH / 2) * kappa;
  const xe = x + w;
  const ye = y + ovalH;
  const xm = x + w / 2;
  const ym = y + ovalH / 2;

  ctx.moveTo(x, ym);
  ctx.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
  ctx.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
  ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
  ctx.lineTo(x + w * 0.4, y + h);
  ctx.lineTo(x + w * 0.3, ye - ovalH * 0.05);
  ctx.bezierCurveTo(x + w * 0.15, ye, x, ym + oy, x, ym);
  ctx.closePath();
}

function drawCloudCallout(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  const cloudTailH = h * 0.2;
  const cloudH = h - cloudTailH;
  ctx.moveTo(x + w * 0.2, y + cloudH * 0.4);
  ctx.bezierCurveTo(x, y + cloudH * 0.1, x + w * 0.3, y - cloudH * 0.1, x + w * 0.4, y + cloudH * 0.2);
  ctx.bezierCurveTo(x + w * 0.5, y - cloudH * 0.2, x + w * 0.8, y, x + w * 0.7, y + cloudH * 0.3);
  ctx.bezierCurveTo(x + w, y + cloudH * 0.2, x + w, y + cloudH * 0.7, x + w * 0.8, y + cloudH * 0.7);
  ctx.bezierCurveTo(x + w * 0.9, y + cloudH, x + w * 0.5, y + cloudH, x + w * 0.5, y + cloudH * 0.8);
  ctx.lineTo(x + w * 0.3, y + h);
  ctx.lineTo(x + w * 0.35, y + cloudH * 0.8);
  ctx.bezierCurveTo(x, y + cloudH, x, y + cloudH * 0.5, x + w * 0.2, y + cloudH * 0.4);
  ctx.closePath();
}
