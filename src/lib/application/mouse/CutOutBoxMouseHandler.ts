import screenDomStore from "@/store/dom/ScreenDomStore";
import toolPanelDomStore from "@/store/dom/ToolPanelDomStore";
import cropBoxStore from "@/store/CropBoxStore";
import drawingDataStore from "@/store/DrawingDataStore";
import toolBarStore from "@/store/ToolBarStore";
import screenShotCanvasStore from "@/store/ScreenShotCanvasStore";
import userParamStore from "@/store/UserParamStore";
import { saveBorderArrInfo } from "@/lib/shared/canvas/SaveBorderArrInfo";
import { showToolBar } from "@/lib/application/LoadCoreComponents";
import {
  selectCanvasElementBorder,
  showCanvasActiveElementBorder
} from "@/lib/shared/canvas/CanvasElementEditUtils";
import { addHistory } from "@/lib/features/canvas/state/AddHistoryData";
import { emitCustomToolMouseUp } from "@/lib/application/mouse/CustomToolEventBridge";
import { TOOL_HANDLE_RADIUS_MULTIPLIER } from "@/lib/constants/canvasTools";
import { CropBoxBorderOption } from "@/lib/constants/cropBoxOptions";
import { calculateMoveBounds, calculateResizeBounds } from "@/lib/application/mouse/SelectionBoxTransformers";
import { TempSelectionBounds } from "@/lib/type/mouse/SelectionBoxTypes";
import {
  renderTempSelectionBounds,
  updateCursorOnSelectionBorder
} from "@/lib/application/mouse/SelectionBoxCursorHandlers";

/**
 * 操作裁剪框
 * @param currentX 裁剪框当前x轴坐标
 * @param currentY 裁剪框当前y轴坐标
 * @param startX 鼠标x轴坐标
 * @param startY 鼠标y轴坐标
 * @param width 裁剪框宽度
 * @param height 裁剪框高度
 * @param context 需要进行绘制的canvas画布
 * @param screenShotImageController
 */
export function operatingCutOutBox(
  currentX: number,
  currentY: number,
  startX: number,
  startY: number,
  width: number,
  height: number,
  context: CanvasRenderingContext2D,
  screenShotImageController: HTMLCanvasElement
) {
  if (screenDomStore.screenShotController == null) {
    return;
  }

  const { moveStartX, moveStartY } = drawingDataStore.movePosition;

  if (
    drawingDataStore.selectionBorderNodes.length > 0 &&
    !toolBarStore.toolClickStatus &&
    !cropBoxStore.draggingTrim
  ) {
    updateCursorOnSelectionBorder(currentX, currentY, context);
  }

  if (cropBoxStore.draggingTrim) {
    calculateSelectionResizeOrMove(
      currentX,
      currentY,
      startX,
      startY,
      width,
      height,
      context,
      screenShotImageController,
      moveStartX,
      moveStartY
    );
  }
}

/**
 * 处理鼠标按下结束后的裁剪框/工具栏逻辑
 * 1. 校验画布上下文是否就绪
 * 2. 恢复上一次活跃元素，避免残留空元素
 * 3. 若当前处于工具栏绘制流程，优先结束绘制
 * 4. 同步裁剪框状态、更新节点并通过需要时展示工具栏面板
 */
export function finalizeSelectionMouseDown(
  dragFlag: boolean,
  resetDragFlagFn: () => void,
  previousElementId: string | null,
  transformedExistingElement = false
) {
  if (!isCanvasSelectionContextReady()) {
    return;
  }

  restoreActiveElementSelection(previousElementId);

  if (handleToolbarCompletion(previousElementId, transformedExistingElement)) {
    return;
  }

  synchronizeSelectionBox();
  updateSelectionNodes();

  if (shouldActivateToolbarPanel(dragFlag)) {
    activateToolbarPanel(resetDragFlagFn);
  }
}

// 校验画布与容器是否存在，防止空指针
const isCanvasSelectionContextReady = () =>
  screenDomStore.screenShotController != null &&
  screenShotCanvasStore.screenShotCanvas != null;

// 清理绘制列表中的空元素并恢复到之前的活跃元素
const restoreActiveElementSelection = (previousElementId: string | null) => {
  drawingDataStore.clearEmptyCanvasElements(len => {
    if (len > 0 && previousElementId != null) {
      drawingDataStore.updateActiveElementId(previousElementId);
    }
  });
};

// 处理工具栏绘制收尾的两种场景：绘制中/仅选中元素
const handleToolbarCompletion = (
  previousElementId: string | null,
  transformedExistingElement: boolean
) => {
  if (!toolBarStore.toolClickStatus) return false;
  const dotRadius = toolBarStore.penSize * TOOL_HANDLE_RADIUS_MULTIPLIER;
  if (drawingDataStore.drawStatus) {
    emitCustomToolMouseUp();
    addHistory();
    if (transformedExistingElement && previousElementId != null) {
      selectCanvasElementBorder(previousElementId, dotRadius);
    }
    return true;
  }
  showCanvasActiveElementBorder(dotRadius);
  return true;
};

// 将临时裁剪框同步为最终坐标
const synchronizeSelectionBox = () => {
  cropBoxStore.updateDrawGraphPosition(
    drawingDataStore.tempGraphPosition.startX,
    drawingDataStore.tempGraphPosition.startY,
    drawingDataStore.tempGraphPosition.width,
    drawingDataStore.tempGraphPosition.height
  );
  if (!toolBarStore.toolClickStatus) {
    const { startX, startY, width, height } = cropBoxStore.drawGraphPosition;
    cropBoxStore.setCutOutBoxPosition(startX, startY, width, height);
  }
};

// 根据当前裁剪框位置生成边框节点数据
const updateSelectionNodes = () => {
  drawingDataStore.updateSelectionBorderNodes(
    saveBorderArrInfo(cropBoxStore.borderSize, cropBoxStore.drawGraphPosition)
  );
};

// 判断拖拽或单击截全屏时是否需要激活工具栏
const shouldActivateToolbarPanel = (dragFlag: boolean) =>
  dragFlag || userParamStore.clickCutFullScreen;

// 激活工具栏、同步 UI 状态
const activateToolbarPanel = (resetDragFlagFn: () => void) => {
  screenDomStore.setCursorStyle("move");
  toolBarStore.setToolStatus(true);
  cropBoxStore.setCutBoxSizeStatus(true);
  resetDragFlagFn();
  if (toolPanelDomStore.toolController != null) {
    showToolBar(
      cropBoxStore.drawGraphPosition,
      drawingDataStore.dpr,
      userParamStore.toolPosition,
      drawingDataStore.getFullScreenStatus
    );
  }
};

function calculateSelectionResizeOrMove(
  currentX: number,
  currentY: number,
  startX: number,
  startY: number,
  width: number,
  height: number,
  context: CanvasRenderingContext2D,
  screenShotImageController: HTMLCanvasElement,
  moveStartX: number,
  moveStartY: number
) {
  const controller = screenDomStore.screenShotController;
  if (controller == null) {
    return;
  }

  const renderBounds = (bounds: TempSelectionBounds) =>
    renderTempSelectionBounds(
      bounds,
      context,
      controller,
      screenShotImageController
    );

  const currentBorderOption = drawingDataStore.borderOption;
  if (currentBorderOption == null) {
    return;
  }

  if (currentBorderOption === CropBoxBorderOption.Move) {
    const moveBounds = calculateMoveBounds({
      currentX,
      currentY,
      startX,
      startY,
      width,
      height,
      moveStartX,
      moveStartY,
      controller,
      dpr: drawingDataStore.dpr
    });
    renderBounds(moveBounds);
    return;
  }

  const resizeBounds = calculateResizeBounds({
    currentX,
    currentY,
    startX,
    startY,
    width,
    height,
    borderOption: currentBorderOption
  });
  renderBounds(resizeBounds);
}
