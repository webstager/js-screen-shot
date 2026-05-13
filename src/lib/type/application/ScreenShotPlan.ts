export type ScreenShotCaptureSource =
  | "static-image"
  | "dom-render"
  | "browser-display-media"
  | "injected-media-stream";

export type ScreenShotRenderStrategy = "browser-frame" | "window-frame";

export type ScreenShotPlan = {
  captureSource: ScreenShotCaptureSource;
  renderStrategy: ScreenShotRenderStrategy;
};
