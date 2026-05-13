import userParamStore from "@/store/UserParamStore";
import { getCanvas2dCtx } from "@/lib/shared/canvas/CanvasPatch";
import screenShotCanvasStore from "@/store/ScreenShotCanvasStore";
import drawingDataStore from "@/store/DrawingDataStore";
import { CanvasEventHandlers } from "@/lib/type/components/events";
import { initScreenShot } from "@/lib/application/core/ScreenInitializer";
import {
  getFrameDrawer,
  type CanvasSize
} from "@/lib/application/core/ScreenFrameDrawer";
import { stopCapture } from "@/lib/application/core/ScreenCapture";
import screenDomStore from "@/store/dom/ScreenDomStore";
import { ScreenShotRenderStrategy } from "@/lib/type/application/ScreenShotPlan";

const SCREENSHOT_SUCCESS_MSG = "截图加载完成";

const resolveCanvasSizes = (
  renderStrategy: ScreenShotRenderStrategy,
  screenShotImageController: HTMLCanvasElement
): CanvasSize => {
  const canvasSize = userParamStore.getCanvasSize();
  const containerWidth =
    canvasSize.canvasWidth !== 0
      ? canvasSize.canvasWidth
      : screenShotImageController.width;
  const containerHeight =
    canvasSize.canvasHeight !== 0
      ? canvasSize.canvasHeight
      : screenShotImageController.height;

  if (renderStrategy === "window-frame") {
    return {
      containerWidth,
      containerHeight,
      imgWidth: containerWidth * drawingDataStore.dpr,
      imgHeight: containerHeight * drawingDataStore.dpr
    };
  }

  return {
    containerWidth,
    containerHeight,
    imgWidth: containerWidth,
    imgHeight: containerHeight
  };
};

const collectDisplayMeta = () => {
  if (drawingDataStore.captureStream == null) {
    return { displaySurface: null, displayLabel: null };
  }
  const [track] = drawingDataStore.captureStream.getVideoTracks();
  if (track == null) {
    return { displaySurface: null, displayLabel: null };
  }
  const settings = track.getSettings();
  return {
    displaySurface: settings?.displaySurface ?? null,
    displayLabel: track.label ?? null
  };
};

const finalizeScreenShotLoad = () => {
  stopCapture();
  document.body.classList.remove("no-cursor");
};

export const loadScreenFlowData = (
  triggerCallback: Function | undefined,
  renderStrategy: ScreenShotRenderStrategy,
  screenShotImageController: HTMLCanvasElement,
  mouseEventFn: CanvasEventHandlers,
  topEl: HTMLDivElement
) => {
  setTimeout(() => {
    topEl.remove();
    const screenShotCanvas = screenDomStore.screenShotController;
    const videoController = screenDomStore.videoController;
    const sizes = resolveCanvasSizes(renderStrategy, screenShotImageController);

    if (screenShotCanvas == null || videoController == null) {
      finalizeScreenShotLoad();
      return;
    }

    const context = getCanvas2dCtx(
      screenShotCanvas,
      sizes.containerWidth,
      sizes.containerHeight
    );
    const imgContext = getCanvas2dCtx(
      screenShotImageController,
      sizes.imgWidth,
      sizes.imgHeight
    );

    if (context == null || imgContext == null) {
      finalizeScreenShotLoad();
      return;
    }

    screenShotCanvasStore.updateScreenShotCanvas(context);

    // 根据当前模式使用对应的绘制策略
    const frameDrawn = getFrameDrawer(renderStrategy).draw({
      ...sizes,
      imgContext,
      videoController
    });

    if (!frameDrawn) {
      finalizeScreenShotLoad();
      return;
    }

    initScreenShot(undefined, context, screenShotImageController, mouseEventFn);

    const { displaySurface, displayLabel } = collectDisplayMeta();
    if (triggerCallback) {
      triggerCallback({
        code: 0,
        msg: SCREENSHOT_SUCCESS_MSG,
        displaySurface,
        displayLabel
      });
    }

    finalizeScreenShotLoad();
  }, userParamStore.wrcReplyTime);
};
