import {
  ScreenShotCaptureOptions,
  ScreenShotCaptureSourceOption,
  ScreenShotOptions
} from "@/lib/type/components/screenshot";

const LEGACY_CAPTURE_OPTION_KEYS = [
  "enableWebRtc",
  "screenFlow",
  "imgSrc",
  "wrcWindowMode"
] as const;

type LegacyCaptureOptionKey = (typeof LEGACY_CAPTURE_OPTION_KEYS)[number];

const isMediaStream = (value: unknown): value is MediaStream =>
  typeof MediaStream !== "undefined" && value instanceof MediaStream;

const hasOwnOption = <T extends object>(
  options: T,
  key: keyof T
): boolean => Object.prototype.hasOwnProperty.call(options, key);

const getUsedLegacyCaptureKeys = (
  options: ScreenShotOptions
): LegacyCaptureOptionKey[] =>
  LEGACY_CAPTURE_OPTION_KEYS.filter(key => hasOwnOption(options, key));

const warnDeprecatedCaptureOptions = (usedKeys: LegacyCaptureOptionKey[]) => {
  if (usedKeys.length === 0) return;
  console.warn(
    `[js-web-screen-shot] ${usedKeys.join(
      ", "
    )} 已被标记为废弃参数，请尽量改用 capture 配置；这些旧参数将在后续版本中移除。`
  );
};

const warnCapturePrecedence = (usedKeys: LegacyCaptureOptionKey[]) => {
  if (usedKeys.length === 0) return;
  console.warn(
    `[js-web-screen-shot] 检测到同时传入 capture 与旧参数 ${usedKeys.join(
      ", "
    )}；当前已优先使用 capture，旧参数将在后续版本中移除。`
  );
};

const resolveCaptureSource = (
  capture: ScreenShotCaptureOptions
): ScreenShotCaptureSourceOption | null => {
  if (capture.source != null) {
    return capture.source;
  }
  if (isMediaStream(capture.stream)) {
    return "injected-stream";
  }
  if (typeof capture.imageSrc === "string" && capture.imageSrc.trim() !== "") {
    return "image";
  }
  return null;
};

const normalizeCaptureSource = (
  normalizedOptions: ScreenShotOptions,
  capture: ScreenShotCaptureOptions,
  source: ScreenShotCaptureSourceOption
) => {
  switch (source) {
    case "display-media":
      normalizedOptions.enableWebRtc = true;
      normalizedOptions.screenFlow = undefined;
      normalizedOptions.imgSrc = undefined;
      return;
    case "dom":
      normalizedOptions.enableWebRtc = false;
      normalizedOptions.screenFlow = undefined;
      normalizedOptions.imgSrc = undefined;
      return;
    case "image":
      if (
        typeof capture.imageSrc !== "string" ||
        capture.imageSrc.trim() === ""
      ) {
        throw new Error(
          'capture.source 为 "image" 时，必须同时传入非空的 capture.imageSrc。'
        );
      }
      normalizedOptions.enableWebRtc = false;
      normalizedOptions.imgSrc = capture.imageSrc;
      normalizedOptions.screenFlow = undefined;
      return;
    case "injected-stream":
      if (!isMediaStream(capture.stream)) {
        throw new Error(
          'capture.source 为 "injected-stream" 时，必须同时传入 capture.stream。'
        );
      }
      normalizedOptions.enableWebRtc = true;
      normalizedOptions.screenFlow = capture.stream;
      normalizedOptions.imgSrc = undefined;
      return;
  }
};

export const normalizeScreenShotOptions = (
  options: ScreenShotOptions
): ScreenShotOptions => {
  const normalizedOptions: ScreenShotOptions = { ...options };
  const usedLegacyCaptureKeys = getUsedLegacyCaptureKeys(options);
  const capture = options.capture;

  if (capture == null) {
    warnDeprecatedCaptureOptions(usedLegacyCaptureKeys);
    return normalizedOptions;
  }

  warnCapturePrecedence(usedLegacyCaptureKeys);

  if (capture.render != null) {
    normalizedOptions.wrcWindowMode = capture.render === "window-frame";
  }

  const source = resolveCaptureSource(capture);
  if (source == null) {
    return normalizedOptions;
  }

  normalizeCaptureSource(normalizedOptions, capture, source);
  return normalizedOptions;
};
