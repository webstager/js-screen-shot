import cropBoxStore from "@/store/CropBoxStore";
import drawingDataStore from "@/store/DrawingDataStore";
import toolBarStore from "@/store/ToolBarStore";
import screenDomStore from "@/store/dom/ScreenDomStore";
import screenShotCanvasStore from "@/store/ScreenShotCanvasStore";
import { nanoid } from "nanoid";
import {
  calculateElementDragOffset,
  hideCanvasActiveElementBorder
} from "@/lib/shared/canvas/CanvasElementEditUtils";
import { updateCursorOnSelectionBorder } from "@/lib/application/mouse/SelectionBoxCursorHandlers";
import toolInteraction from "@/lib/application/mouse/ToolInteraction";
import { emitCustomToolMouseDown } from "@/lib/application/mouse/CustomToolEventBridge";
import { isCustomTool } from "@/lib/application/core/HistoryManager";
import { CanvasElement } from "@/lib/type/editor/canvasElements";
import { handleTextToolInteraction } from "@/lib/application/mouse/TextToolInteraction";
import { getPointerCoordinates } from "@/lib/application/mouse/MouseMoveMetrics";
import { initPencil } from "@/lib/features/canvas/drawing/DrawPencil";

type ToolbarInteractionContext = {
  event: MouseEvent | TouchEvent;
  mouseX: number;
  mouseY: number;
};

export type ToolbarInteractionState = {
  prevElementId: string | null;
  dragOffset: { x: number; y: number };
  transformingExisting: boolean;
};

// === 公共导出方法 ===

// 从鼠标/触摸事件中提取画布坐标
export const getPointerPosition = (event: MouseEvent | TouchEvent) => {
  const { x, y } = getPointerCoordinates(event);
  return { mouseX: x, mouseY: y };
};

// 在点击空白区域时，必要时清除选区边框；返回新的上一元素 id
export const clearSelectionBorderIfNeeded = (
  mouseX: number,
  mouseY: number,
  prevElementId: string | null
): string | null => {
  if (!toolBarStore.toolClickStatus || !hasCanvasSelection()) {
    return prevElementId;
  }

  let hoveredElementId: string | null = null;
  // 检测鼠标下是否有元素，若有则保留当前选区
  drawingDataStore.checkMouseInElement(mouseX, mouseY, elementId => {
    hoveredElementId = elementId;
  });

  if (hoveredElementId != null) {
    return prevElementId;
  }

  // 点击空白处，尝试隐藏选区边框
  const cleared = hideCanvasActiveElementBorder();
  return cleared ? null : prevElementId;
};

// 处理工具栏绘制起始逻辑，返回更新后的拖拽状态
export const prepareToolbarInteraction = (
  context: ToolbarInteractionContext,
  state: ToolbarInteractionState
): ToolbarInteractionState => {
  const canvasContext = screenShotCanvasStore.screenShotCanvas;
  // 非绘制流程或缺少画布上下文时，直接返回原状态
  if (!toolInteraction.isToolbarDrawing() || canvasContext == null) {
    return state;
  }

  // 初始化绘制前的 UI 与事件状态
  updateToolbarMouseDownUi(context, canvasContext);

  let hitElementId: string | null = null;
  drawingDataStore.checkMouseInElement(context.mouseX, context.mouseY, id => {
    hitElementId = id;
  });

  const activeElementId = drawingDataStore.activeElementId ?? hitElementId;
  const isTextTool = toolBarStore.toolName === "text";
  const pointerStyle = screenDomStore.mousePointer;
  const shouldTransformExistingElement = hitElementId != null;
  const activeElementSnapshot =
    hitElementId != null
      ? drawingDataStore.getCanvasElement(hitElementId)
      : activeElementId != null
      ? drawingDataStore.getCanvasElement(activeElementId)
      : null;
  const interactingWithExistingText =
    isTextTool &&
    shouldTransformExistingElement &&
    hitElementId != null &&
    activeElementSnapshot?.type === "text";

  // 与现有文本交互
  if (interactingWithExistingText && hitElementId != null) {
    return handleExistingTextInteraction(
      context.mouseX,
      context.mouseY,
      hitElementId,
      pointerStyle,
      true
    );
  }

  if (isTextTool) {
    return handleTextToolStart(
      context.mouseX,
      context.mouseY,
      activeElementId,
      shouldTransformExistingElement
    );
  }

  if (hitElementId != null) {
    emitCustomToolMouseDown(context.event, context.mouseX, context.mouseY);
    const dragOffset = calculateElementDragOffset(
      context.mouseX,
      context.mouseY,
      hitElementId
    );
    drawingDataStore.resetCanvasElementNodeState();
    drawingDataStore.updateActiveElementId(hitElementId);
    return {
      prevElementId: hitElementId,
      dragOffset,
      transformingExisting: true
    };
  }

  if (isCustomTool()) {
    return startCustomToolDrawing(context);
  }

  return createElementForDrawing(context.mouseX, context.mouseY);
};

// 如有画笔上下文则初始化画笔起点
export const initBrushIfNeeded = (mouseX: number, mouseY: number) => {
  const brushContext = toolInteraction.getBrushContext();
  if (brushContext) {
    initPencil(brushContext, mouseX, mouseY);
  }
};

// 触发文本工具交互，返回是否成功处理
export const runTextToolInteraction = (mouseX: number, mouseY: number) => {
  const textToolContext = toolInteraction.getTextToolContext();
  return Boolean(
    textToolContext &&
      handleTextToolInteraction(mouseX, mouseY, textToolContext)
  );
};

// === 内部辅助方法 ===

// 画布上是否存在可编辑的选区或节点
const hasCanvasSelection = () =>
  drawingDataStore.activeElementId != null ||
  drawingDataStore.canvasElements.some(element =>
    Boolean(element.element?.drawNode)
  );

const updateToolbarMouseDownUi = (
  context: ToolbarInteractionContext,
  canvasContext: CanvasRenderingContext2D
) => {
  // 更新裁剪框位置并同步光标
  cropBoxStore.updateDrawGraphPosition(context.mouseX, context.mouseY);
  updateCursorOnSelectionBorder(context.mouseX, context.mouseY, canvasContext);
};

const startCustomToolDrawing = (
  context: ToolbarInteractionContext
): ToolbarInteractionState => {
  hideCanvasActiveElementBorder();
  emitCustomToolMouseDown(context.event, context.mouseX, context.mouseY);
  return {
    prevElementId: null,
    dragOffset: { x: 0, y: 0 },
    transformingExisting: false
  };
};

const handleExistingTextInteraction = (
  mouseX: number,
  mouseY: number,
  activeElementId: string,
  pointerStyle: string | null,
  transformingExisting = false
): ToolbarInteractionState => {
  // 命中已有文本且为变换指针时，仅计算偏移并更新光标
  const prevElementId = activeElementId;
  const dragOffset = calculateElementDragOffset(mouseX, mouseY, prevElementId);
  if (pointerStyle != null) {
    screenDomStore.setCursorStyle(pointerStyle);
  }
  return { prevElementId, dragOffset, transformingExisting };
};

const handleTextToolStart = (
  mouseX: number,
  mouseY: number,
  activeElementId: string | null,
  shouldTransformExistingElement: boolean
): ToolbarInteractionState => {
  // 文本工具首次点击：若需要变换，计算偏移；否则重置偏移
  if (!shouldTransformExistingElement) {
    hideCanvasActiveElementBorder();
  }
  const prevElementId = activeElementId;
  const dragOffset = shouldTransformExistingElement
    ? calculateElementDragOffset(mouseX, mouseY, prevElementId)
    : { x: 0, y: 0 };
  return {
    prevElementId,
    dragOffset,
    transformingExisting: shouldTransformExistingElement
  };
};

const createElementForDrawing = (
  mouseX: number,
  mouseY: number
): ToolbarInteractionState => {
  // 非文本工具开始新绘制时，先清理旧元素选中态，避免旧边框残留
  hideCanvasActiveElementBorder();
  const elementId = nanoid();

  drawingDataStore.addElement({
    id: elementId,
    type: toolBarStore.toolName,
    element: {
      id: elementId,
      x: 0,
      y: 0
    } as CanvasElement
  });

  drawingDataStore.updateActiveElementId(elementId);

  const dragOffset = calculateElementDragOffset(mouseX, mouseY, elementId);

  return { prevElementId: elementId, dragOffset, transformingExisting: false };
};
