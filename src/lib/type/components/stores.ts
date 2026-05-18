import type { ToolName } from "@/lib/type/editor/toolNames";
import type { TextToolInfo } from "@/lib/type/components/text";
import type { TextElement } from "@/lib/type/editor/canvasElements";
import type {
  CropBoxBounds,
  CropBoxPreset,
  DragStartPosition,
  SelectionBorderNode
} from "@/lib/type/components/cropBox";
import type { CropBoxBorderOption } from "@/lib/constants/cropBoxOptions";
import type { CanvasElementSnapshot } from "@/lib/type/components/canvas";
import type {
  CustomToolbarItem,
  ToolPlacement,
  ToolVerticalAnchor
} from "@/lib/type/components/toolbar";
import type {
  CanvasEventCallbacks,
  RightClickEventConfig
} from "@/lib/type/components/events";
import type { CustomCanvasElementAdapter } from "@/lib/type/components/customElement";
import type {
  HiddenScrollbarOptions,
  ImageSize,
  CanvasExportOptions,
  SnapDomCaptureOptions,
  SnapDomRenderer,
  ScreenShotCursorCapture,
  ScreenShotOptions,
  ViewportOffset
} from "@/lib/type/components/screenshot";

export type ScreenDomStoreDataType = {
  screenShotController: HTMLCanvasElement | null;
  cutBoxSizeContainer: HTMLDivElement | null;
  textInputController: HTMLDivElement | null;
  videoController: HTMLVideoElement | null;
  noScrollStatus: boolean;
  resetScrollbarState: boolean;
  mousePointer: string;
  keyboardEventHandler: ((event: KeyboardEvent) => void) | null;
};

export type ToolPanelDomStoreDataType = {
  toolController: HTMLDivElement | null;
  optionIcoController: HTMLDivElement | null;
  optionController: HTMLDivElement | null;
  colorSelectPanel: HTMLElement | null;
  brushSelectionController: HTMLDivElement | null;
  colorSelectController: HTMLElement | null;
  rightPanel: HTMLElement | null;
  undoController: HTMLElement | null;
};

export type CropBoxStoreDataType = {
  draggingTrim: boolean;
  dragging: boolean;
  borderSize: number;
  cutOutBoxPosition: CropBoxBounds;
  drawGraphPosition: CropBoxBounds;
};

export type DrawingStoreDataType = {
  dpr: number;
  getFullScreenStatus: boolean;
  selectionBorderNodes: Array<SelectionBorderNode>;
  captureStream: MediaStream | null;
  movePosition: DragStartPosition;
  history: Array<Record<string, any>>;
  borderOption: CropBoxBorderOption | null;
  mouseInsideCropBox: boolean;
  tempGraphPosition: CropBoxBounds;
  textInputPosition: { mouseX: number; mouseY: number };
  drawGraphPrevX: number;
  drawGraphPrevY: number;
  drawStatus: boolean;
  degreeOfBlur: number;
  resetAllStore: boolean;
  canUndo: boolean;
  canvasElements: Array<CanvasElementSnapshot>;
  activeElementId: string | null;
  rectOperateIndex: number | null;
  editingTextElementId: string | null;
  pendingEditingTextElement: TextElement | null;
};

export type ScreenShotCanvasStoreDataType = {
  imageController: HTMLCanvasElement | null;
  screenShotCanvas: CanvasRenderingContext2D | null;
};

export type ToolBarStoreDataType = {
  toolClickStatus: boolean;
  selectedColor: string;
  toolName: ToolName;
  toolId: number | null;
  penSize: number;
  fontSize: number;
  mosaicPenSize: number;
  toolVerticalAnchor: ToolVerticalAnchor;
  activeTool: string;
  textEditState: boolean;
  textInfo: TextToolInfo;
};

export type UserParamStoreDataType = {
  enableWebRtc: boolean;
  menuBarHeight: number;
  clickCutFullScreen: boolean;
  imgSrc: string | null;
  loadCrossImg: boolean;
  proxyUrl: string | undefined;
  useCORS: boolean;
  h2cIgnoreElementsFn: (element: Element) => boolean;
  position: ViewportOffset;
  wrcReplyTime: number;
  cropBoxInfo: CropBoxPreset | null;
  toolPosition: ToolPlacement;
  wrcImgPosition: CropBoxPreset;
  hiddenScrollBar: HiddenScrollbarOptions;
  wrcWindowMode: boolean;
  customRightClickEvent: RightClickEventConfig;
  screenFlow: MediaStream | null;
  canvasWidth: number;
  canvasHeight: number;
  showScreenData: boolean;
  screenShotDom: HTMLElement | null;
  destroyContainer: boolean;
  maskColor: { r: number; g: number; b: number; a: number };
  writeBase64: boolean;
  exportOptions: Required<CanvasExportOptions>;
  cutBoxBdColor: string;
  maxUndoNum: number;
  useRatioArrow: boolean;
  imgAutoFit: boolean;
  useCustomImgSize: boolean;
  customImgSize: ImageSize;
  userToolbar: Array<CustomToolbarItem>;
  h2cCrossImgLoadErrFn: ScreenShotOptions["h2cImgLoadErrCallback"] | null;
  saveCallback: ((code: number, msg: string, base64: string) => void) | null;
  saveImgTitle: string | null;
  canvasEvents: CanvasEventCallbacks | null;
  customElementAdapters: Array<CustomCanvasElementAdapter>;
  renderOptions: { x: number; y: number };
  canvasElements: Array<CanvasElementSnapshot>;
  domRenderEngine: "html2canvas" | "snapdom";
  snapdom: SnapDomRenderer | null;
  snapdomOptions: SnapDomCaptureOptions;
  captureCursor: ScreenShotCursorCapture;
};
