import {
  executeCaptureSource,
  loadImageSource,
  h2cScreenShot
} from "@/lib/application/core/ScreenSourceManager";
import { ScreenShotMode } from "@/lib/application/core/ScreenShotModeResolver";
import { resolveRenderStrategy } from "@/lib/application/core/ScreenShotModeResolver";
import {
  ScreenShotCaptureSource,
  ScreenShotPlan
} from "@/lib/type/application/ScreenShotPlan";
import { CanvasEventHandlers } from "@/lib/type/components/events";
import userParamStore from "@/store/UserParamStore";
import { destroyScreenShotDom } from "@/store/dom/domCleanup";

type ImageControllerGetter = () => HTMLCanvasElement;
type ImageControllerSetter = (canvas: HTMLCanvasElement) => void;

type ScreenShotModeContext = {
  mouseEvents: CanvasEventHandlers;
  context: CanvasRenderingContext2D;
  triggerCallback?: Function;
  cancelCallback?: Function;
  getImageController: ImageControllerGetter;
  setImageController: ImageControllerSetter;
};

type ScreenShotPlanContext = ScreenShotModeContext & {
  plan: ScreenShotPlan;
};

const legacyModeToCaptureSourceMap: Record<
  ScreenShotMode,
  ScreenShotCaptureSource
> = {
  image: "static-image",
  html2canvas: "dom-render",
  "injected-stream": "injected-media-stream",
  webrtc: "browser-display-media"
};

export const executeLoadMode = (
  mode: ScreenShotMode,
  mouseEvents: CanvasEventHandlers,
  context: CanvasRenderingContext2D,
  triggerCallback: Function | undefined,
  cancelCallback: Function | undefined,
  getImageController: ImageControllerGetter,
  setImageController: ImageControllerSetter
) => {
  return executeLoadPlan(
    {
      captureSource: legacyModeToCaptureSourceMap[mode],
      renderStrategy: resolveRenderStrategy()
    },
    mouseEvents,
    context,
    triggerCallback,
    cancelCallback,
    getImageController,
    setImageController
  );
};

export const executeLoadPlan = (
  plan: ScreenShotPlan,
  mouseEvents: CanvasEventHandlers,
  context: CanvasRenderingContext2D,
  triggerCallback: Function | undefined,
  cancelCallback: Function | undefined,
  getImageController: ImageControllerGetter,
  setImageController: ImageControllerSetter
) => {
  const modeContext: ScreenShotPlanContext = {
    plan,
    mouseEvents,
    context,
    triggerCallback,
    cancelCallback,
    getImageController,
    setImageController
  };

  const handlers: Record<
    ScreenShotCaptureSource,
    (ctx: ScreenShotPlanContext) => void
  > = {
    "static-image": handleImageMode,
    "dom-render": handleHtml2CanvasMode,
    "injected-media-stream": handleStreamCaptureMode,
    "browser-display-media": handleStreamCaptureMode
  };

  const handler =
    handlers[plan.captureSource] ?? handlers["browser-display-media"];
  handler(modeContext);
};

const handleImageMode = (ctx: ScreenShotPlanContext) => {
  const {
    mouseEvents,
    context,
    triggerCallback,
    getImageController,
    setImageController,
    cancelCallback
  } = ctx;
  const imgSrc = userParamStore.imgSrc;
  if (imgSrc == null) return;
  const promise = loadImageSource(
    triggerCallback,
    context,
    getImageController(),
    imgSrc,
    mouseEvents
  );
  pipeCanvasResult(promise, "image", { setImageController, cancelCallback });
};

const handleHtml2CanvasMode = (ctx: ScreenShotPlanContext) => {
  const {
    mouseEvents,
    context,
    triggerCallback,
    setImageController,
    cancelCallback
  } = ctx;
  const promise = h2cScreenShot(triggerCallback, context, mouseEvents);
  pipeCanvasResult(promise, "html2canvas", {
    setImageController,
    cancelCallback
  });
};

const handleStreamCaptureMode = (ctx: ScreenShotPlanContext) => {
  const {
    plan,
    mouseEvents,
    triggerCallback,
    cancelCallback,
    getImageController
  } = ctx;
  const promise = executeCaptureSource(
    plan,
    cancelCallback,
    triggerCallback,
    getImageController(),
    mouseEvents
  );
  pipeStreamResult(
    promise,
    plan.captureSource === "injected-media-stream"
      ? "injected-stream"
      : "webrtc",
    cancelCallback
  );
};

const pipeCanvasResult = (
  promise: Promise<HTMLCanvasElement>,
  mode: ScreenShotMode,
  {
    setImageController,
    cancelCallback
  }: Pick<ScreenShotModeContext, "setImageController" | "cancelCallback">
) => {
  promise
    .then(canvas => {
      setImageController(canvas);
    })
    .catch(error => {
      handleScreenShotError(mode, error, cancelCallback);
    });
};

const pipeStreamResult = (
  promise: Promise<MediaStream | null>,
  mode: ScreenShotMode,
  cancelCallback: Function | undefined
) => {
  promise.catch(error => {
    handleScreenShotError(mode, error, cancelCallback);
  });
};

const handleScreenShotError = (
  mode: ScreenShotMode,
  error: unknown,
  cancelCallback: Function | undefined
) => {
  console.error(`[ScreenShotModeExecutor] ${mode} mode failed`, error);
  cancelCallback?.(error);
  destroyScreenShotDom();
};
