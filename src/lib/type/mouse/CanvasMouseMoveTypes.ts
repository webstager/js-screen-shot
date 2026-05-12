import { DrawArrow } from "@/lib/features/canvas/drawing/DrawArrow";

export type MouseMoveMetrics = {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  tempWidth: number;
  tempHeight: number;
};

export type ToolbarDrawingContext = MouseMoveMetrics & {
  event: MouseEvent | TouchEvent;
  drawArrow: DrawArrow;
  dragOffset: { x: number; y: number };
  prevElementId: string | null;
  transformingExisting?: boolean;
};

export type CropBoxSize = {
  width: number;
  height: number;
};
