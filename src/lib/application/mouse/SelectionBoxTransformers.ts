/**
 * 裁剪框在移动/缩放时需要用到的纯计算方法。
 * 抽离到独立模块方便复用，也能在单元测试中直接验证。
 */
import { fixedData } from "@/lib/shared/platform/FixedData";
import { CropBoxResizeState } from "@/lib/type/components/cropBox";
import { zoomCutOutBoxPosition } from "@/lib/shared/canvas/ZoomCutOutBoxPosition";

import {
  TempSelectionBounds,
  DragPositionParams,
  ResizeSelectionParams
} from "@/lib/type/mouse/SelectionBoxTypes";

/**
 * 根据拖拽过程中的指针位置计算新的起点，
 * 同时结合画布尺寸做边界裁剪，保证裁剪框不会移出可视区域。
 */
const calculateDragPosition = ({
  currentX,
  currentY,
  startX,
  startY,
  width,
  height,
  moveStartX,
  moveStartY,
  controller,
  dpr
}: DragPositionParams) => {
  let nextX = fixedData(
    currentX - (moveStartX - startX),
    width,
    controller.width
  );
  let nextY = fixedData(
    currentY - (moveStartY - startY),
    height,
    controller.height
  );

  const containerWidth = controller.width / dpr;
  const containerHeight = controller.height / dpr;

  if (nextX + width > containerWidth) {
    nextX = containerWidth - width;
  }
  if (nextY + height > containerHeight) {
    nextY = containerHeight - height;
  }

  return { x: nextX, y: nextY };
};

/**
 * 对外暴露的移动计算函数，返回更新后的裁剪框边界。
 */
export const calculateMoveBounds = (
  params: DragPositionParams
): TempSelectionBounds => {
  const { x, y } = calculateDragPosition(params);
  return {
    startX: x,
    startY: y,
    width: params.width,
    height: params.height
  };
};

/**
 * 对外暴露的缩放计算函数，根据不同操作点返回新的矩形。
 */
export const calculateResizeBounds = ({
  currentX,
  currentY,
  startX,
  startY,
  width,
  height,
  borderOption
}: ResizeSelectionParams): TempSelectionBounds => {
  const {
    tempStartX,
    tempStartY,
    tempWidth,
    tempHeight
  } = zoomCutOutBoxPosition(
    currentX,
    currentY,
    startX,
    startY,
    width,
    height,
    borderOption
  ) as CropBoxResizeState;

  return {
    startX: tempStartX,
    startY: tempStartY,
    width: tempWidth,
    height: tempHeight
  };
};
