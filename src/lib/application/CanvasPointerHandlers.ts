import screenDomStore from "@/store/dom/ScreenDomStore";
import drawingDataStore from "@/store/DrawingDataStore";
import toolBarStore from "@/store/ToolBarStore";
import screenShotCanvasStore from "@/store/ScreenShotCanvasStore";
import { DrawArrow } from "@/lib/features/canvas/drawing/DrawArrow";
import { finalizeSelectionMouseDown } from "@/lib/application/mouse/CutOutBoxMouseHandler";
import toolInteraction from "@/lib/application/mouse/ToolInteraction";
import {
  beginCropBoxResize,
  prepareCropBoxDraw
} from "@/lib/application/mouse/CropBoxInteraction";
import {
  handleToolbarDrawing,
  isNotElementDrag,
  isToolbarDrawing,
  handleCropBoxDrawing,
  buildMouseMoveMetrics
} from "@/lib/application/mouse/CanvasMouseMoveHandlers";
import {
  captureFullScreenSelection,
  isCanvasEnvironmentReady,
  shouldCaptureFullScreenSelection,
  shouldRestoreCropBoxPosition,
  restorePreviousCropBoxPosition
} from "@/lib/application/mouse/CanvasMouseDownHandlers";
import {
  clearSelectionBorderIfNeeded,
  getPointerPosition,
  initBrushIfNeeded,
  runTextToolInteraction,
  type ToolbarInteractionState,
  prepareToolbarInteraction
} from "@/lib/application/mouse/CanvasMouseClickHandlers";
import { TOOL_HANDLE_RADIUS_MULTIPLIER } from "@/lib/constants/canvasTools";
import { handleMouseMoveOnElement } from "@/lib/shared/canvas/CanvasElementEditUtils";

const pointerSession: ToolbarInteractionState = {
  prevElementId: null,
  dragOffset: { x: 0, y: 0 },
  transformingExisting: false
};

const updatePointerSession = (state: ToolbarInteractionState) => {
  pointerSession.prevElementId = state.prevElementId;
  pointerSession.dragOffset = state.dragOffset;
  pointerSession.transformingExisting = state.transformingExisting;
};

export const handleCanvasPointerDown = (event: MouseEvent | TouchEvent) => {
  // 重置工具栏锚点，便于后续重新计算位置
  toolBarStore.resetToolVerticalAnchor();
  // 计算当前指针位置（鼠标 / 触摸统一）
  const { mouseX, mouseY } = getPointerPosition(event);

  pointerSession.prevElementId = clearSelectionBorderIfNeeded(
    mouseX,
    mouseY,
    pointerSession.prevElementId
  );
  const nextState = prepareToolbarInteraction(
    {
      event,
      mouseX,
      mouseY
    },
    pointerSession
  );
  updatePointerSession(nextState);

  initBrushIfNeeded(mouseX, mouseY);

  if (runTextToolInteraction(mouseX, mouseY)) {
    return;
  }

  // 裁剪框-调整大小与位置
  if (toolInteraction.isCropBoxManipulation()) {
    beginCropBoxResize(mouseX, mouseY);
    return;
  }
  // 裁剪框-重新绘制
  prepareCropBoxDraw(mouseX, mouseY);
};

export const handleCanvasPointerMove = (
  event: MouseEvent | TouchEvent,
  screenShotImageController: HTMLCanvasElement,
  drawArrow: DrawArrow
) => {
  const canvasContext = screenShotCanvasStore.screenShotCanvas;
  const screenShotController = screenDomStore.screenShotController;
  if (canvasContext == null || screenShotController == null) {
    return;
  }
  const { metrics, cropBoxSize } = buildMouseMoveMetrics(event);

  // 不处于元素拖动状态
  if (isNotElementDrag()) {
    drawingDataStore.checkMouseInElement(
      metrics.currentX,
      metrics.currentY,
      elementId => {
        const dotRadius = toolBarStore.penSize * TOOL_HANDLE_RADIUS_MULTIPLIER;
        handleMouseMoveOnElement(
          elementId,
          metrics.currentX,
          metrics.currentY,
          dotRadius
        );
      }
    );
    return;
  }

  // 工具栏元素绘制
  if (isToolbarDrawing()) {
    handleToolbarDrawing({
      ...metrics,
      event,
      drawArrow,
      dragOffset: pointerSession.dragOffset,
      prevElementId: pointerSession.prevElementId,
      transformingExisting: pointerSession.transformingExisting
    });
    return;
  }

  // 裁剪框绘制
  handleCropBoxDrawing(
    metrics,
    cropBoxSize.width,
    cropBoxSize.height,
    screenShotImageController,
    canvasContext,
    screenShotController
  );
};

export const handleCanvasPointerUp = (
  dragFlag: boolean,
  screenShotImageController: HTMLCanvasElement,
  resetDragFlagFn: () => void
) => {
  if (!isCanvasEnvironmentReady()) {
    return;
  }

  // 复原裁剪框位置
  if (shouldRestoreCropBoxPosition(dragFlag)) {
    restorePreviousCropBoxPosition();
    return;
  }

  // 截全屏
  if (shouldCaptureFullScreenSelection(dragFlag)) {
    captureFullScreenSelection(screenShotImageController);
  }

  finalizeSelectionMouseDown(
    dragFlag,
    resetDragFlagFn,
    pointerSession.prevElementId,
    pointerSession.transformingExisting
  );
};
