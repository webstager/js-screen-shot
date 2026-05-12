import screenShotCanvasStore from "@/store/ScreenShotCanvasStore";
import { getMaskingViewSize } from "@/lib/features/canvas/drawing/DrawMasking";
import screenDomStore from "@/store/dom/ScreenDomStore";
import cropBoxStore from "@/store/CropBoxStore";
import { drawCutOutBox } from "@/lib/features/canvas/drawing/DrawCutOutBox";

/**
 * 清空遮罩画布，并按当前裁剪框重新绘制截取区域的边框
 */
export const clearCanvasSurface = () => {
  const screenShotCanvas = screenShotCanvasStore.screenShotCanvas;
  if (screenShotCanvas == null) return;
  const { maxWidth, maxHeight } = getMaskingViewSize();
  screenShotCanvas.clearRect(0, 0, maxWidth, maxHeight);
  const controller = screenDomStore.screenShotController;
  const imageController = screenShotCanvasStore.imageController;
  if (controller == null || imageController == null) return;
  const { startX, startY, width, height } = cropBoxStore.cutOutBoxPosition;
  drawCutOutBox(
    startX,
    startY,
    width,
    height,
    screenShotCanvas,
    cropBoxStore.borderSize,
    controller,
    imageController,
    false
  );
};
