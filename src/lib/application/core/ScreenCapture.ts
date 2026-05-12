import drawingDataStore from "@/store/DrawingDataStore";
import userParamStore from "@/store/UserParamStore";
import { destroyScreenShotDom } from "@/store/dom/domCleanup";
import screenDomStore from "@/store/dom/ScreenDomStore";

type ExtendedMediaTrackConstraints = MediaTrackConstraints & {
  displaySurface?: string;
  cursor?: "always" | "motion" | "never";
};

const buildVideoConstraints = (
  screenShotImageController: HTMLCanvasElement
): ExtendedMediaTrackConstraints => {
  const baseWidth = screenShotImageController.width * drawingDataStore.dpr;
  const baseHeight = screenShotImageController.height * drawingDataStore.dpr;
  const constraints: ExtendedMediaTrackConstraints = {
    cursor: "always",
    width: baseWidth,
    height: baseHeight,
    displaySurface: "browser"
  };

  if (userParamStore.wrcWindowMode) {
    constraints.width = window.screen.width * drawingDataStore.dpr;
    constraints.height = window.screen.height * drawingDataStore.dpr;
    constraints.displaySurface = "window";
  }

  return constraints;
};

const handleCaptureError = (
  cancelCallback: Function | undefined,
  err: unknown
) => {
  const payload = {
    code: -1,
    msg: "浏览器不支持webrtc或者用户未授权",
    errorInfo: err
  };
  if (cancelCallback != null) {
    cancelCallback(payload);
  }
  destroyScreenShotDom();
  if (cancelCallback == null) {
    throw `${payload.msg}( ${err} )`;
  }
};

export const startCapture = async (
  cancelCallback: Function | undefined,
  screenShotImageController: HTMLCanvasElement
) => {
  let captureStream: MediaStream | null = null;
  const videoConstraints = buildVideoConstraints(screenShotImageController);

  try {
    captureStream = await navigator.mediaDevices.getDisplayMedia({
      video: videoConstraints,
      audio: false
    });
    drawingDataStore.updateCaptureStream(captureStream);
    screenDomStore.setVideoSrcObject(captureStream);
  } catch (err) {
    handleCaptureError(cancelCallback, err);
  }

  return captureStream;
};

export const stopCapture = () => {
  if (screenDomStore.videoController == null) return;
  const srcObject = screenDomStore.videoController.srcObject;
  if (srcObject && "getTracks" in srcObject) {
    const tracks = srcObject.getTracks();
    tracks.forEach(track => track.stop());
    screenDomStore.setVideoSrcObject(null);
  }
};
