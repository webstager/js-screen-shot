import cropBoxStore from "@/store/CropBoxStore";
import drawingDataStore from "@/store/DrawingDataStore";
import { drawCutOutBox } from "@/lib/features/canvas/drawing/DrawCutOutBox";
import { operatingCutOutBox } from "@/lib/application/mouse/CutOutBoxMouseHandler";
import { CropBoxRenderBounds } from "@/lib/type/components/cropBox";
import { MouseMoveMetrics } from "@/lib/type/mouse/CanvasMouseMoveTypes";

export const handleCropBoxDrawing = (
  { startX, startY, currentX, currentY, tempWidth, tempHeight }: MouseMoveMetrics,
  width: number,
  height: number,
  screenShotImageController: HTMLCanvasElement,
  canvasContext: CanvasRenderingContext2D,
  screenShotController: HTMLCanvasElement
) => {
  operatingCutOutBox(
    currentX,
    currentY,
    startX,
    startY,
    width,
    height,
    canvasContext,
    screenShotImageController
  );

  if (!cropBoxStore.dragging || cropBoxStore.draggingTrim) return;

  const tempGraphPosition = drawCutOutBox(
    startX,
    startY,
    tempWidth,
    tempHeight,
    canvasContext,
    cropBoxStore.borderSize,
    screenShotController,
    screenShotImageController
  ) as CropBoxRenderBounds;

  drawingDataStore.updateTempGraphPosition(
    tempGraphPosition.startX,
    tempGraphPosition.startY,
    tempGraphPosition.width,
    tempGraphPosition.height
  );
};
