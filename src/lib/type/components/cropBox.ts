import type {
  CropBoxBorderOption,
  CropBoxBorderStyleIndex
} from "@/lib/constants/cropBoxOptions";

export type SelectionBorderNode = {
  x: number;
  y: number;
  width: number;
  height: number;
  index: CropBoxBorderStyleIndex; // 样式
  option: CropBoxBorderOption; // 操作
};

export type BorderContext = {
  startX: number;
  startY: number;
  width: number;
  height: number;
  endX: number;
  endY: number;
  centerX: number;
  centerY: number;
  halfBorderSize: number;
  innerWidth: number;
  innerHeight: number;
  borderSize: number;
};

export type BorderTemplate = {
  option: CropBoxBorderOption;
  index: CropBoxBorderStyleIndex;
  x: (ctx: BorderContext) => number;
  y: (ctx: BorderContext) => number;
  width: (ctx: BorderContext) => number;
  height: (ctx: BorderContext) => number;
};

export type DragStartPosition = {
  moveStartX: number;
  moveStartY: number;
};

export type CropBoxBounds = {
  startX: number;
  startY: number;
  width: number;
  height: number;
};

export type CropBoxResizeState = {
  tempStartX: number;
  tempStartY: number;
  tempWidth: number;
  tempHeight: number;
};

export type CropBoxRenderBounds = CropBoxBounds;

export type CropBoxPreset = {
  x: number;
  y: number;
  w: number;
  h: number;
};
