import userParamStore from "@/store/UserParamStore";
import drawingDataStore from "@/store/DrawingDataStore";
import html2canvas from "html2canvas";
import { drawCrossImg } from "@/lib/features/canvas/drawing/drawCrossImg";
import { CanvasEventHandlers } from "@/lib/type/components/events";
import { initScreenShot } from "@/lib/application/core/ScreenInitializer";
import { drawImgToCanvas } from "@/lib/features/canvas/drawing/DrawImgToCanvas";
import {
  CaptureStreamStrategy,
  InjectedStreamStrategy
} from "@/lib/application/core/ScreenStreamStrategy";
import { ScreenStreamStrategy } from "@/lib/type/application/ScreenStream";
import { startCapture } from "@/lib/application/core/ScreenCapture";
import { loadScreenFlowData } from "@/lib/application/core/ScreenFlowLoader";
import { destroyScreenShotDom } from "@/store/dom/domCleanup";
import screenDomStore from "@/store/dom/ScreenDomStore";
import { SCREENSHOT_OVERLAY_Z_INDEX } from "@/lib/constants/dom";


// 注入流失败时触发回调并销毁 DOM
const handleStreamFailure = (cancelCallback: Function | undefined) => {
  const payload = { code: -1, msg: "视频流接入失败" };
  if (cancelCallback != null) {
    cancelCallback(payload);
  }
  destroyScreenShotDom();
};

// 执行具体的流获取策略，获取成功后统一进入截图加载流程
const executeStreamStrategy = async (
  strategy: ScreenStreamStrategy,
  triggerCallback: Function | undefined,
  screenShotImageController: HTMLCanvasElement,
  mouseEventFn: CanvasEventHandlers
) => {
  // 创建遮罩层用于屏蔽屏幕元素、隐藏鼠标
  const getTopEl = () => {
    const topEl = document.createElement("div");
    topEl.style.cssText = `position: fixed;top: 0;left: 0;width: ${innerWidth}px;height: ${innerHeight}px;z-index: ${SCREENSHOT_OVERLAY_Z_INDEX};cursor: none;`;
    return topEl;
  };
  const stream = await strategy.acquireStream();
  if (stream == null) return null;
  const topEl = getTopEl();
  document.body.appendChild(topEl);
  loadScreenFlowData(
    triggerCallback,
    screenShotImageController,
    mouseEventFn,
    topEl
  );
  return stream;
};

// WebRTC 模式下通过屏幕捕获流初始化截图流程
export const wrcScreenShot = (
  cancelCallback: Function | undefined,
  triggerCallback: Function | undefined,
  screenShotImageController: HTMLCanvasElement,
  mouseEventFn: CanvasEventHandlers
) =>
  executeStreamStrategy(
    new CaptureStreamStrategy(() =>
      startCapture(cancelCallback, screenShotImageController)
    ),
    triggerCallback,
    screenShotImageController,
    mouseEventFn
  );

// 外部注入视频流时的截图入口
export const sendStream = (
  stream: MediaStream | null,
  cancelCallback: Function | undefined,
  triggerCallback: Function | undefined,
  screenShotImageController: HTMLCanvasElement,
  mouseEventFn: CanvasEventHandlers
) =>
  executeStreamStrategy(
    new InjectedStreamStrategy(stream, () =>
      handleStreamFailure(cancelCallback)
    ),
    triggerCallback,
    screenShotImageController,
    mouseEventFn
  );


// 通过传入图片资源初始化截图画布
export const loadImageSource = (
  triggerCallback: Function | undefined,
  context: CanvasRenderingContext2D,
  screenShotImageController: HTMLCanvasElement,
  imgSrc: string,
  mouseEventFn: CanvasEventHandlers
): Promise<HTMLCanvasElement> =>
  drawImgToCanvas(
    imgSrc,
    screenShotImageController.width,
    screenShotImageController.height,
    drawingDataStore.dpr
  ).then(canvas => {
    initScreenShot(triggerCallback, context, canvas, mouseEventFn);
    return canvas;
  });

// html2canvas 模式渲染 DOM 并进入截图流程
export const h2cScreenShot = async (
  triggerCallback: Function | undefined,
  context: CanvasRenderingContext2D,
  mouseEventFn: CanvasEventHandlers
): Promise<HTMLCanvasElement> => {
  const target = userParamStore.screenShotDom ?? document.body;
  try {
    const canvas = await html2canvas(target, {
      x: userParamStore.renderOptions.x,
      y: userParamStore.renderOptions.y,
      onclone: userParamStore.loadCrossImg ? drawCrossImg : undefined,
      proxy: userParamStore.proxyUrl,
      ignoreElements: userParamStore.h2cIgnoreElementsFn,
      useCORS: userParamStore.useCORS
    });
    if (screenDomStore.screenShotController != null) {
      initScreenShot(triggerCallback, context, canvas, mouseEventFn);
    }
    return canvas;
  } catch (err) {
    if (triggerCallback != null) {
      triggerCallback({ code: -1, msg: err });
    }
    throw err;
  }
};
