import cropBoxStore from "@/store/CropBoxStore";
import drawingDataStore from "@/store/DrawingDataStore";
import screenDomStore from "@/store/dom/ScreenDomStore";
import screenShotCanvasStore from "@/store/ScreenShotCanvasStore";
import toolBarStore from "@/store/ToolBarStore";
import userParamStore from "@/store/UserParamStore";
import { drawCutOutBox } from "@/lib/features/canvas/drawing/DrawCutOutBox";
import { CropBoxRenderBounds } from "@/lib/type/components/cropBox";

export const isCanvasEnvironmentReady = () =>
  screenShotCanvasStore.screenShotCanvas != null &&
  screenDomStore.screenShotController != null;

// 工具栏未点击&鼠标未拖动&单击截屏状态为false则复原裁剪框位置
export const shouldRestoreCropBoxPosition = (dragFlag: boolean) =>
  !toolBarStore.toolClickStatus &&
  !dragFlag &&
  !userParamStore.clickCutFullScreen;

export const restorePreviousCropBoxPosition = () => {
  cropBoxStore.updateDrawGraphPosition(
    drawingDataStore.drawGraphPrevX,
    drawingDataStore.drawGraphPrevY
  );
};

const isEmptyCutBox = () => {
  const { width, height, startX, startY } = cropBoxStore.cutOutBoxPosition;
  return width === 0 && height === 0 && startX === 0 && startY === 0;
};

/**
 * 截取整个屏幕
 * 1. 调用者尚未拖拽生成选区
 * 2. 鼠标尚未拖动
 * 3. 单击截取屏幕状态为true
 * @param dragFlag
 */
export const shouldCaptureFullScreenSelection = (dragFlag: boolean) =>
  isEmptyCutBox() && !dragFlag && userParamStore.clickCutFullScreen;

export const captureFullScreenSelection = (
  screenShotImageController: HTMLCanvasElement
) => {
  const screenShotController = screenDomStore.screenShotController;
  const canvasContext = screenShotCanvasStore.screenShotCanvas;
  if (screenShotController == null || canvasContext == null) {
    return;
  }
  const borderSize = cropBoxStore.borderSize;
  drawingDataStore.updateFullScreenStatus(true);
  const width =
    screenShotController.clientWidth ||
    parseFloat(screenShotController.style.width) ||
    screenShotController.width;
  const height =
    screenShotController.clientHeight ||
    parseFloat(screenShotController.style.height) ||
    screenShotController.height;
  const tempGraphPosition = drawCutOutBox(
    0,
    0,
    width - borderSize / 2,
    height - borderSize / 2,
    canvasContext,
    borderSize,
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
