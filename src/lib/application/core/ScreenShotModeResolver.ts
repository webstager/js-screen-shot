import userParamStore from "@/store/UserParamStore";
import { ScreenShotMode } from "@/lib/type/application/ScreenShotMode";
export type { ScreenShotMode } from "@/lib/type/application/ScreenShotMode";

type LoadModeResolver = {
  mode: ScreenShotMode;
  predicate: () => boolean;
};

const modeResolvers: LoadModeResolver[] = [
  {
    mode: "image",
    predicate: () =>
      !userParamStore.enableWebRtc && userParamStore.imgSrc != null
  },
  {
    mode: "html2canvas",
    predicate: () => !userParamStore.enableWebRtc
  },
  {
    mode: "injected-stream",
    predicate: () => userParamStore.screenFlow != null
  }
];

export const resolveScreenShotMode = (): ScreenShotMode => {
  const matched = modeResolvers.find(resolver => resolver.predicate());
  return matched?.mode ?? "webrtc";
};
