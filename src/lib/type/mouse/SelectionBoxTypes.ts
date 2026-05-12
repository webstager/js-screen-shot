export type TempSelectionBounds = {
  startX: number;
  startY: number;
  width: number;
  height: number;
};

export type DragPositionParams = {
  currentX: number;
  currentY: number;
  startX: number;
  startY: number;
  width: number;
  height: number;
  moveStartX: number;
  moveStartY: number;
  controller: HTMLCanvasElement;
  dpr: number;
};

import { CropBoxBorderOption } from "@/lib/constants/cropBoxOptions";

export type ResizeSelectionParams = {
  currentX: number;
  currentY: number;
  startX: number;
  startY: number;
  width: number;
  height: number;
  borderOption: CropBoxBorderOption;
};
