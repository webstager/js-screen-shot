import {
  loadImageSource,
  h2cScreenShot,
  sendStream,
  wrcScreenShot
} from "@/lib/application/core/ScreenSourceManager";
import { ScreenShotMode } from "@/lib/application/core/ScreenShotModeResolver";
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

export const executeLoadMode = (
  mode: ScreenShotMode,
  mouseEvents: CanvasEventHandlers,
  context: CanvasRenderingContext2D,
  triggerCallback: Function | undefined,
  cancelCallback: Function | undefined,
  getImageController: ImageControllerGetter,
  setImageController: ImageControllerSetter
) => {
  const modeContext: ScreenShotModeContext = {
    mouseEvents,
    context,
    triggerCallback,
    cancelCallback,
    getImageController,
    setImageController
  };

  const handlers: Record<
    ScreenShotMode,
    (ctx: ScreenShotModeContext) => void
  > = {
    image: handleImageMode,
    html2canvas: handleHtml2CanvasMode,
    "injected-stream": handleInjectedStreamMode,
    webrtc: handleWebRtcMode
  };

  const handler = handlers[mode] ?? handlers.webrtc;
  handler(modeContext);
};

const handleImageMode = (ctx: ScreenShotModeContext) => {
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

const handleHtml2CanvasMode = (ctx: ScreenShotModeContext) => {
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

const handleInjectedStreamMode = (ctx: ScreenShotModeContext) => {
  const {
    mouseEvents,
    triggerCallback,
    cancelCallback,
    getImageController
  } = ctx;
  const promise = sendStream(
    userParamStore.screenFlow,
    cancelCallback,
    triggerCallback,
    getImageController(),
    mouseEvents
  );
  pipeStreamResult(promise, "injected-stream", cancelCallback);
};

const handleWebRtcMode = (ctx: ScreenShotModeContext) => {
  const {
    mouseEvents,
    triggerCallback,
    cancelCallback,
    getImageController
  } = ctx;
  const promise = wrcScreenShot(
    cancelCallback,
    triggerCallback,
    getImageController(),
    mouseEvents
  );
  pipeStreamResult(promise, "webrtc", cancelCallback);
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
