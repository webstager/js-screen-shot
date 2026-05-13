import userParamStore from "@/store/UserParamStore";
import { ScreenShotMode } from "@/lib/type/application/ScreenShotMode";
import {
  ScreenShotCaptureSource,
  ScreenShotPlan,
  ScreenShotRenderStrategy
} from "@/lib/type/application/ScreenShotPlan";
export type { ScreenShotMode } from "@/lib/type/application/ScreenShotMode";
export type {
  ScreenShotCaptureSource,
  ScreenShotPlan,
  ScreenShotRenderStrategy
} from "@/lib/type/application/ScreenShotPlan";

type LoadModeResolver = {
  captureSource: ScreenShotCaptureSource;
  predicate: () => boolean;
};

const modeResolvers: LoadModeResolver[] = [
  {
    captureSource: "static-image",
    predicate: () =>
      !userParamStore.enableWebRtc && userParamStore.imgSrc != null
  },
  {
    captureSource: "dom-render",
    predicate: () => !userParamStore.enableWebRtc
  },
  {
    captureSource: "injected-media-stream",
    predicate: () => userParamStore.screenFlow != null
  }
];

export const resolveRenderStrategy = (): ScreenShotRenderStrategy =>
  userParamStore.wrcWindowMode ? "window-frame" : "browser-frame";

export const resolveScreenShotPlan = (): ScreenShotPlan => {
  const matched = modeResolvers.find(resolver => resolver.predicate());
  return {
    captureSource: matched?.captureSource ?? "browser-display-media",
    renderStrategy: resolveRenderStrategy()
  };
};

export const resolveScreenShotMode = (): ScreenShotMode => {
  const { captureSource } = resolveScreenShotPlan();
  const sourceToModeMap: Record<ScreenShotCaptureSource, ScreenShotMode> = {
    "static-image": "image",
    "dom-render": "html2canvas",
    "injected-media-stream": "injected-stream",
    "browser-display-media": "webrtc"
  };

  return sourceToModeMap[captureSource];
};
