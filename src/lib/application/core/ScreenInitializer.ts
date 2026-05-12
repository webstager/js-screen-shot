import userParamStore from "@/store/UserParamStore";
import screenShotCanvasStore from "@/store/ScreenShotCanvasStore";
import { drawMasking } from "@/lib/features/canvas/drawing/DrawMasking";
import { isPC, isTouchDevice } from "@/lib/shared/platform/DeviceTypeVerif";
import { CanvasEventHandlers } from "@/lib/type/components/events";
import { CropBoxPreset } from "@/lib/type/components/cropBox";
import cropBoxStore from "@/store/CropBoxStore";
import { drawCutOutBox } from "@/lib/features/canvas/drawing/DrawCutOutBox";
import drawingDataStore from "@/store/DrawingDataStore";
import { saveBorderArrInfo } from "@/lib/shared/canvas/SaveBorderArrInfo";
import toolBarStore from "@/store/ToolBarStore";
import { showToolBar } from "@/lib/application/core/UiCoordinator";
import { getToolRelativePosition } from "@/lib/shared/dom/GetToolRelativePosition";
import screenDomStore from "@/store/dom/ScreenDomStore";
import toolPanelDomStore from "@/store/dom/ToolPanelDomStore";
import { addHistory } from "@/lib/features/canvas/state/AddHistoryData";
import { registerDomDisposer } from "@/store/dom/domDisposers";

export const initScreenShot = (
  triggerCallback: Function | undefined,
  context: CanvasRenderingContext2D,
  screenShotImgDataSource: HTMLCanvasElement,
  mouseEventFn: CanvasEventHandlers
) => {
  if (triggerCallback != null) {
    triggerCallback({ code: 0, msg: "截图加载完成" });
  }
  screenShotCanvasStore.updateScreenShotCanvas(context);
  screenShotCanvasStore.setImageController(screenShotImgDataSource);
  drawMasking(context, screenShotImgDataSource);
  setScreenShotContainerEventListener(
    mouseEventFn.mouseDownEvent,
    mouseEventFn.mouseMoveEvent,
    mouseEventFn.mouseUpEvent
  );
  if (
    userParamStore.cropBoxInfo != null &&
    Object.keys(userParamStore.cropBoxInfo).length === 4
  ) {
    initCropBox(userParamStore.cropBoxInfo, screenShotImgDataSource);
  }
  renderPresetCanvasElements();
};

export const setScreenShotContainerSize = (
  screenShotImageController: HTMLCanvasElement
) => {
  const canvasSize = userParamStore.getCanvasSize();
  const viewSize = {
    width: parseFloat(window.getComputedStyle(document.body).width),
    height: parseFloat(window.getComputedStyle(document.body).height)
  };
  configureScreenSize(viewSize.width, viewSize.height);
  positionScreenShotContainer(
    userParamStore.position.left,
    userParamStore.position.top
  );
  screenShotImageController.width = viewSize.width;
  screenShotImageController.height = viewSize.height;
  if (canvasSize.canvasWidth !== 0 && canvasSize.canvasHeight !== 0) {
    configureScreenSize(canvasSize.canvasWidth, canvasSize.canvasHeight);
    screenShotImageController.width = canvasSize.canvasWidth;
    screenShotImageController.height = canvasSize.canvasHeight;
  }
};

const setScreenShotContainerEventListener = (
  mouseDownEvent: CanvasEventHandlers["mouseDownEvent"],
  mouseMoveEvent: CanvasEventHandlers["mouseMoveEvent"],
  mouseUpEvent: CanvasEventHandlers["mouseUpEvent"]
) => {
  const controller = screenDomStore.screenShotController;
  if (controller == null) return;
  if (isPC()) {
    controller.addEventListener("mousedown", mouseDownEvent);
    controller.addEventListener("mousemove", mouseMoveEvent);
    controller.addEventListener("mouseup", mouseUpEvent);
    registerDomDisposer(() => {
      controller.removeEventListener("mousedown", mouseDownEvent);
      controller.removeEventListener("mousemove", mouseMoveEvent);
      controller.removeEventListener("mouseup", mouseUpEvent);
    });
  }
  if (!isTouchDevice()) return;
  controller.addEventListener("touchstart", mouseDownEvent, false);
  controller.addEventListener("touchmove", mouseMoveEvent, false);
  controller.addEventListener("touchend", mouseUpEvent, false);
  registerDomDisposer(() => {
    controller.removeEventListener("touchstart", mouseDownEvent, false);
    controller.removeEventListener("touchmove", mouseMoveEvent, false);
    controller.removeEventListener("touchend", mouseUpEvent, false);
  });
};

const initCropBox = (
  cropBoxInfo: CropBoxPreset,
  screenShotImageController: HTMLCanvasElement
) => {
  const startX = cropBoxInfo.x;
  const startY = cropBoxInfo.y;
  const width = cropBoxInfo.w;
  const height = cropBoxInfo.h;
  if (screenDomStore.screenShotController == null) return;
  cropBoxStore.updateDrawGraphPosition(startX, startY, width, height);
  cropBoxStore.setCutOutBoxPosition(startX, startY, width, height);
  drawCutOutBox(
    startX,
    startY,
    width,
    height,
    screenShotCanvasStore.screenShotCanvas as CanvasRenderingContext2D,
    cropBoxStore.borderSize,
    screenDomStore.screenShotController,
    screenShotImageController
  );
  drawingDataStore.updateSelectionBorderNodes(
    saveBorderArrInfo(cropBoxStore.borderSize, cropBoxStore.drawGraphPosition)
  );
  // 初始化裁剪框时同步鼠标样式，保持 store 状态一致
  screenDomStore.setCursorStyle("move");
  toolBarStore.setToolStatus(true);
  cropBoxStore.setCutBoxSizeStatus(true);
  if (toolPanelDomStore.toolController != null) {
    showToolBar(
      cropBoxStore.drawGraphPosition,
      drawingDataStore.dpr,
      userParamStore.toolPosition,
      drawingDataStore.getFullScreenStatus
    );
  }
};

const configureScreenSize = (width: number, height: number) => {
  if (screenDomStore.noScrollStatus) {
    document.body.classList.add("__screenshot-lock-scroll");
  }
  screenDomStore.updateScreenShotControllerSize(width, height);
};

const positionScreenShotContainer = (left: number, top: number) => {
  const { left: relativeLeft, top: relativeTop } = getToolRelativePosition(
    left,
    top
  );
  screenDomStore.updateScreenShotPosition(relativeLeft, relativeTop);
};

const renderPresetCanvasElements = () => {
  const presetElements = userParamStore.getCanvasElements();
  if (
    presetElements.length === 0 ||
    screenShotCanvasStore.screenShotCanvas == null ||
    screenDomStore.screenShotController == null
  ) {
    return;
  }
  drawingDataStore.replaceCanvasElements(presetElements);
  drawingDataStore.redrawCanvasElements();
  addHistory();
};
