import React from 'react';
import { Tool } from '../../../shared/types';

export interface Point {
  x: number;
  y: number;
}

export type TextBackgroundMode = 'transparent' | 'color';

export interface CanvasProps {
  currentTool: Tool;
  setCurrentTool: (tool: Tool) => void;
  primaryColor: string;
  secondaryColor: string;
  strokeSize: number;
  width: number;
  height: number;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  onDraw: (dataUrl?: string) => void;
  onColorPick?: (color: string, isSecondary: boolean) => void;
  pastedImage?: { src: string; id: number } | null;
  showRulers?: boolean;
  showGridlines?: boolean;
  textBackgroundMode: TextBackgroundMode;
  shapeBackgroundMode: TextBackgroundMode;
}

export interface CurveState {
  step: 0 | 1 | 2;
  start: Point;
  end: Point;
  cp1?: Point;
  cp2?: Point;
}

export interface PolygonState {
  points: Point[];
  currentPos: Point;
}

export interface TextInputState extends Point {
  text: string;
  screenX: number;
  screenY: number;
  scale: number;
  w: number;
  h: number;
}

export interface SelectionState {
  active: boolean;
  x: number;
  y: number;
  w: number;
  h: number;
  isMoving: boolean;
  isResizing?: string | null;
  startX: number;
  startY: number;
  startW?: number;
  startH?: number;
  startOriginX?: number;
  startOriginY?: number;
  image?: HTMLCanvasElement | null;
  isPasted?: boolean;
  path?: Point[];
}
