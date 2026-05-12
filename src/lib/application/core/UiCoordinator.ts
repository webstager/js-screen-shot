import userParamStore from "@/store/UserParamStore";
import toolBarStore from "@/store/ToolBarStore";
import screenShotCanvasStore from "@/store/ScreenShotCanvasStore";
import { calculateToolLocation } from "@/lib/features/canvas/calculations";
import cropBoxStore from "@/store/CropBoxStore";
import { CropBoxBounds } from "@/lib/type/components/cropBox";
import {
  ToolPlacement,
  ToolVerticalAnchor
} from "@/lib/type/components/toolbar";
import drawingDataStore from "@/store/DrawingDataStore";
import { destroyScreenShotDom } from "@/store/dom/domCleanup";
import screenDomStore from "@/store/dom/ScreenDomStore";
import toolPanelDomStore from "@/store/dom/ToolPanelDomStore";
import { finalizeTextInput } from "@/lib/shared/text/TextInputFinalizer";
import {
  CUT_BOX_LABEL_VERTICAL_OFFSET,
  FULLSCREEN_TOOLBAR_OFFSET,
  TOOLBAR_HEIGHT_FALLBACK,
  TOOLBAR_OPTION_PANEL_HEIGHT_FALLBACK,
  TOOLBAR_OPTION_TRIANGLE_HEIGHT,
  TOOLBAR_VERTICAL_MARGIN
} from "@/lib/constants/toolbar";
import { registerDomDisposer } from "@/store/dom/domDisposers";

export const registerForRightClickEvent = (container: HTMLElement) => {
  const handler = (e: MouseEvent) => {
    e.preventDefault();
    if (userParamStore.customRightClickEvent.handleFn) {
      userParamStore.customRightClickEvent.handleFn();
      return;
    }
    destroyScreenShotDom();
  };
  container.addEventListener("contextmenu", handler);
  registerDomDisposer(() => {
    container.removeEventListener("contextmenu", handler);
  });
};

export const registerContainerShortcuts = (container: HTMLDivElement) => {
  const handler = (event: KeyboardEvent) => {
    const context = screenShotCanvasStore.screenShotCanvas;
    if (context == null) return;
    const isConfirm =
      (event.metaKey || event.ctrlKey) && event.code === "Enter";
    const isCancel = event.code === "Escape";
    if (isConfirm || isCancel) {
      event.preventDefault();
      event.stopPropagation();
      finalizeTextInput({
        controller: container,
        canvasContext: context,
        persistText: !isCancel
      });
    }
  };
  container.addEventListener("keydown", handler);
  registerDomDisposer(() => {
    container.removeEventListener("keydown", handler);
  });
};

export const showToolBar = (
  drawGraphPosition: CropBoxBounds,
  dpr: number,
  placement: ToolPlacement,
  getFullScreenStatus: boolean,
  fullScreenDiffHeight = FULLSCREEN_TOOLBAR_OFFSET
) => {
  if (
    toolPanelDomStore.toolController == null ||
    screenDomStore.screenShotController == null
  )
    return;
  const toolLocation = calculateToolLocation(
    drawGraphPosition,
    toolPanelDomStore.toolController.offsetWidth,
    screenDomStore.screenShotController.width / dpr,
    placement,
    userParamStore.position
  );
  const containerHeight = getScreenShotVisibleHeight(
    screenDomStore.screenShotController,
    dpr
  );
  const toolbarHeight = getToolbarHeight();
  const optionBlockHeight = getOptionBlockHeight(toolbarHeight);
  const verticalPlacement = resolveToolbarVerticalPlacement(
    toolLocation.mouseY,
    drawGraphPosition,
    containerHeight,
    toolbarHeight,
    optionBlockHeight,
    fullScreenDiffHeight
  );
  toolLocation.mouseY = verticalPlacement.y;
  let toolbarAnchor = verticalPlacement.anchor;

  if (toolbarAnchor === "above") {
    cropBoxStore.setCutBoxSizeStatus(false);
  }

  if (getFullScreenStatus) {
    const containerHeight = getScreenShotVisibleHeight(
      screenDomStore.screenShotController,
      dpr
    );
    const toolPositionX =
      (drawGraphPosition.width - toolPanelDomStore.toolController.offsetWidth) /
      2;
    toolLocation.mouseY = containerHeight - fullScreenDiffHeight;
    toolLocation.mouseX = toolPositionX;
    toolbarAnchor = "above";
  }

  toolBarStore.setToolInfo(
    toolLocation.mouseX + userParamStore.position.left,
    toolLocation.mouseY + userParamStore.position.top
  );
  toolBarStore.setToolVerticalAnchor(toolbarAnchor);

  cropBoxStore.setCutBoxSizePosition(
    drawGraphPosition.startX,
    drawGraphPosition.startY - CUT_BOX_LABEL_VERTICAL_OFFSET
  );
  cropBoxStore.setCutBoxSize(drawGraphPosition.width, drawGraphPosition.height);
  drawingDataStore.updateFullScreenStatus(false);
};

function getToolbarHeight() {
  return (
    toolPanelDomStore.toolController?.offsetHeight ?? TOOLBAR_HEIGHT_FALLBACK
  );
}

function getOptionBlockHeight(toolbarHeight: number) {
  const optionHeight =
    toolPanelDomStore.optionController?.offsetHeight ||
    TOOLBAR_OPTION_PANEL_HEIGHT_FALLBACK;
  return toolbarHeight + TOOLBAR_OPTION_TRIANGLE_HEIGHT + optionHeight;
}

function getScreenShotVisibleHeight(
  screenShotController: HTMLCanvasElement,
  dpr: number
) {
  const height =
    screenShotController.clientHeight ||
    parseFloat(screenShotController.style.height) ||
    screenShotController.height / dpr;
  return Math.max(0, height - userParamStore.menuBarHeight);
}

function resolveToolbarVerticalPlacement(
  desiredY: number,
  drawGraphPosition: CropBoxBounds,
  containerHeight: number,
  toolbarHeight: number,
  optionBlockHeight: number,
  fullScreenDiffHeight: number
): { y: number; anchor: ToolVerticalAnchor } {
  if (desiredY + optionBlockHeight <= containerHeight) {
    return { y: desiredY, anchor: "below" };
  }

  let flippedY =
    drawGraphPosition.startY - toolbarHeight - TOOLBAR_VERTICAL_MARGIN;
  const optionHeight = optionBlockHeight - toolbarHeight;
  if (flippedY - optionHeight < 0) {
    flippedY = Math.max(optionHeight, containerHeight - fullScreenDiffHeight);
  }
  return { y: flippedY, anchor: "above" };
}

export const adjustContainerLevels = (level: number) => {
  if (
    screenDomStore.screenShotController == null ||
    toolPanelDomStore.toolController == null ||
    screenDomStore.textInputController == null ||
    toolPanelDomStore.optionIcoController == null ||
    toolPanelDomStore.optionController == null ||
    screenDomStore.cutBoxSizeContainer == null ||
    level <= 0
  ) {
    return;
  }
  const baseLevel = `${level}`;
  const overlayLevel = `${level + 1}`;
  screenDomStore.screenShotController.style.zIndex = baseLevel;
  const overlayTargets = [
    toolPanelDomStore.toolController,
    screenDomStore.textInputController,
    toolPanelDomStore.optionIcoController,
    toolPanelDomStore.optionController,
    screenDomStore.cutBoxSizeContainer
  ];
  overlayTargets.forEach(target => {
    if (target != null) {
      target.style.zIndex = overlayLevel;
    }
  });
};
