import { getCanvas2dCtx } from "@/lib/shared/canvas/CanvasPatch";
import drawingDataStore from "@/store/DrawingDataStore";
import userParamStore from "@/store/UserParamStore";
import screenDomStore from "@/store/dom/ScreenDomStore";
import {
  ScreenFrameDrawer,
  DrawFrameParams,
  ScreenShotRenderStrategy
} from "@/lib/type/application/ScreenFrame";
export type { CanvasSize } from "@/lib/type/application/ScreenFrame";

const fillHiddenScrollGap = (
  imgContext: CanvasRenderingContext2D,
  containerWidth: number,
  diffHeight: number,
  startY: number
) => {
  const { hiddenScrollBar } = userParamStore;
  const widthOverride = hiddenScrollBar.fillWidth;
  const heightOverride = hiddenScrollBar.fillHeight;
  const fillColor = hiddenScrollBar.color ?? "#000000";

  let fillWidth = containerWidth;
  let fillHeight = diffHeight;

  if (typeof widthOverride === "number" && widthOverride > 0) {
    fillWidth = widthOverride;
  }
  if (typeof heightOverride === "number" && heightOverride > 0) {
    fillHeight = heightOverride;
  }

  imgContext.beginPath();
  imgContext.rect(0, startY, fillWidth, fillHeight);
  imgContext.fillStyle = fillColor;
  imgContext.fill();
};

class WindowFrameDrawer implements ScreenFrameDrawer {
  draw({
    imgContext,
    videoController,
    imgWidth,
    imgHeight
  }: DrawFrameParams): boolean {
    const bodyImgData = getWindowContentData(
      videoController.videoWidth,
      videoController.videoHeight,
      imgWidth,
      imgHeight,
      drawingDataStore.dpr
    );
    if (bodyImgData == null) return false;
    imgContext.putImageData(bodyImgData, 0, 0);
    return true;
  }
}

class BrowserFrameDrawer implements ScreenFrameDrawer {
  draw({
    imgContext,
    videoController,
    containerWidth,
    containerHeight
  }: DrawFrameParams): boolean {
    const { videoWidth, videoHeight } = videoController;
    let fixWidth = containerWidth;
    let fixHeight = (videoHeight * containerWidth) / videoWidth;

    if (fixHeight > containerHeight) {
      fixWidth = (containerWidth * containerHeight) / fixHeight;
      fixHeight = containerHeight;
    }

    const { wrcImgPosition } = userParamStore;
    fixWidth = wrcImgPosition.w > 0 ? wrcImgPosition.w : fixWidth;
    fixHeight = wrcImgPosition.h > 0 ? wrcImgPosition.h : fixHeight;

    imgContext.drawImage(
      videoController,
      wrcImgPosition.x,
      wrcImgPosition.y,
      fixWidth,
      fixHeight
    );

    const diffHeight = containerHeight - fixHeight;
    if (
      userParamStore.hiddenScrollBar.state &&
      diffHeight > 0 &&
      userParamStore.hiddenScrollBar.fillState
    ) {
      fillHiddenScrollGap(imgContext, containerWidth, diffHeight, fixHeight);
    }

    return true;
  }
}

const frameDrawers: Record<ScreenShotRenderStrategy, ScreenFrameDrawer> = {
  "window-frame": new WindowFrameDrawer(),
  "browser-frame": new BrowserFrameDrawer()
};

export const getFrameDrawer = (
  renderStrategy: ScreenShotRenderStrategy
): ScreenFrameDrawer => frameDrawers[renderStrategy];

export const getWindowContentData = (
  videoWidth: number,
  videoHeight: number,
  containerWidth: number,
  containerHeight: number,
  dpr: number
) => {
  const videoCanvas = document.createElement("canvas");
  videoCanvas.width = videoWidth;
  videoCanvas.height = videoHeight;
  const videoContext = getCanvas2dCtx(videoCanvas, videoWidth, videoHeight);
  if (videoContext && screenDomStore.videoController) {
    videoContext.drawImage(screenDomStore.videoController, 0, 0);
    const startX = 0;
    const startY = videoHeight - containerHeight;
    const width = containerWidth;
    const height = videoHeight - startY;
    return videoContext.getImageData(
      startX * dpr,
      startY * dpr,
      width * dpr,
      height * dpr
    );
  }
  return null;
};
