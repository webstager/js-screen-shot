import type {
  CropBoxBounds,
  CropBoxPreset
} from "@/lib/type/components/cropBox";
import type {
  ToolVisibilityMap,
  ToolPlacement,
  UserToolbarItem
} from "@/lib/type/components/toolbar";
import type {
  CanvasEventCallbacks,
  RightClickEventConfig
} from "@/lib/type/components/events";
import type { CanvasElementSnapshot } from "@/lib/type/components/canvas";
import type { CustomCanvasElementAdapter } from "@/lib/type/components/customElement";

export type HiddenScrollbarOptions = {
  state: boolean;
  color?: string;
  fillWidth?: number;
  fillHeight?: number;
  fillState?: boolean;
};

export type ViewportOffset = {
  top: number;
  left: number;
};

export type ImageSize = {
  w: number;
  h: number;
};

export type ScreenShotCaptureSourceOption =
  | "display-media"
  | "injected-stream"
  | "dom"
  | "snapdom"
  | "image";

export type ScreenShotRenderMode = "browser-frame" | "window-frame";

export type ScreenShotCursorCapture = "always" | "motion" | "never";

export type SnapDomCaptureOptions = Record<string, unknown>;

export type SnapDomRenderer = {
  toCanvas: (
    element: HTMLElement,
    options?: SnapDomCaptureOptions
  ) => Promise<HTMLCanvasElement>;
};

export type ScreenShotCaptureOptions = {
  source?: ScreenShotCaptureSourceOption;
  render?: ScreenShotRenderMode;
  cursor?: ScreenShotCursorCapture;
  stream?: MediaStream;
  imageSrc?: string;
  snapdom?: SnapDomRenderer;
  snapdomOptions?: SnapDomCaptureOptions;
};

export type CanvasExportType = "image/png" | "image/jpeg" | "image/webp";

export type CanvasExportOptions = {
  type?: CanvasExportType;
  quality?: number;
};

export type ScreenShotOptions = {
  x?: number;
  y?: number;
  capture?: ScreenShotCaptureOptions;
  enableWebRtc?: boolean;
  screenFlow?: MediaStream;
  level?: number;
  menuBarHeight?: number;
  canvasWidth?: number;
  canvasHeight?: number;
  completeCallback?: (imgInfo: {
    base64: string;
    cutInfo: CropBoxBounds;
  }) => void;
  closeCallback?: () => void;
  h2cImgLoadErrCallback?: (err: Event & { imgUrl: string }) => void;
  triggerCallback?: (res: {
    code: number;
    msg: string;
    displaySurface: string | null;
    displayLabel: string | null;
  }) => void;
  cancelCallback?: (res: {
    code: number;
    msg: string;
    errorInfo: string;
  }) => void;
  saveCallback?: (code: number, msg: string, base64: string) => void;
  position?: Partial<ViewportOffset>;
  clickCutFullScreen?: boolean;
  hiddenToolIco?: ToolVisibilityMap;
  showScreenData?: boolean;
  imgSrc?: string;
  loadCrossImg?: boolean;
  proxyUrl?: string;
  useCORS?: boolean;
  screenShotDom?: HTMLElement | HTMLDivElement | HTMLCanvasElement;
  cropBoxInfo?: CropBoxPreset;
  wrcReplyTime?: number;
  wrcImgPosition?: CropBoxPreset;
  noScroll?: boolean;
  maskColor?: { r: number; g: number; b: number; a: number };
  toolPosition?: ToolPlacement;
  writeBase64?: boolean;
  exportOptions?: CanvasExportOptions;
  hiddenScrollBar?: HiddenScrollbarOptions;
  wrcWindowMode?: boolean;
  customRightClickEvent?: RightClickEventConfig;
  cutBoxBdColor?: string;
  maxUndoNum?: number;
  useRatioArrow?: boolean;
  imgAutoFit?: boolean;
  useCustomImgSize?: boolean;
  customImgSize?: ImageSize;
  saveImgTitle?: string;
  destroyContainer?: boolean;
  userToolbar?: Array<UserToolbarItem>;
  canvasEvents?: CanvasEventCallbacks;
  customElementAdapters?: Array<CustomCanvasElementAdapter>;
  h2cIgnoreElementsCallback?: (element: Element) => boolean;
  canvasElements?: Array<CanvasElementSnapshot>;
};
