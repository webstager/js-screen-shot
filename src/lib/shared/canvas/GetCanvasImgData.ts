import { saveCanvasToImage } from "@/lib/shared/canvas/SaveCanvasToImage";
import { saveCanvasToBase64 } from "@/lib/shared/canvas/SaveCanvasToBase64";

import cropBoxStore from "@/store/CropBoxStore";
import userParamStore from "@/store/UserParamStore";
import screenShotCanvasStore from "@/store/ScreenShotCanvasStore";

/**
 * 将指定区域的canvas转为图片
 */
export function getCanvasImgData(isSave: boolean) {
  const screenShotCanvas = screenShotCanvasStore.screenShotCanvas;
  // 获取裁剪区域位置信息
  const { startX, startY, width, height } = cropBoxStore.cutOutBoxPosition;
  const { type, quality } = userParamStore.exportOptions;
  let base64 = "";
  if (screenShotCanvas) {
    if (isSave) {
      // 将canvas转为图片
      saveCanvasToImage(
        screenShotCanvas,
        startX,
        startY,
        width,
        height,
        quality,
        type
      );
    }
    // 将canvas转为base64
    base64 = saveCanvasToBase64(
      screenShotCanvas,
      startX,
      startY,
      width,
      height,
      quality,
      userParamStore.writeBase64,
      type
    );
  }
  return base64;
}
