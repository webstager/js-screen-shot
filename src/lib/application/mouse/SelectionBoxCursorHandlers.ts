/**
 * 与裁剪框 hover、光标样式以及临时渲染相关的辅助方法。
 * 主 Handler 调用这些函数即可，不需要关心内部如何处理 DOM 与 store。
 */
import drawingDataStore from "@/store/DrawingDataStore";
import toolBarStore from "@/store/ToolBarStore";
import screenDomStore from "@/store/dom/ScreenDomStore";
import { updateContainerMouseStyle } from "@/lib/shared/dom/UpdateContainerMouseStyle";
import {
  BORDER_CURSOR_STYLE,
  CropBoxBorderStyleIndex
} from "@/lib/constants/cropBoxOptions";
import { TempSelectionBounds } from "@/lib/type/mouse/SelectionBoxTypes";
import { CropBoxRenderBounds } from "@/lib/type/components/cropBox";
import cropBoxStore from "@/store/CropBoxStore";
import { drawCutOutBox } from "@/lib/features/canvas/drawing/DrawCutOutBox";

// 根据当前命中的节点索引设置鼠标样式
const applyCursorStyle = (borderIndex: CropBoxBorderStyleIndex) => {
  if (toolBarStore.toolClickStatus) {
    if (
      borderIndex === CropBoxBorderStyleIndex.Move &&
      screenDomStore.screenShotController != null
    ) {
      updateContainerMouseStyle(
        screenDomStore.screenShotController,
        toolBarStore.activeTool
      );
    }
    return;
  }

  const cursorStyle = BORDER_CURSOR_STYLE[borderIndex];
  if (cursorStyle) {
    screenDomStore.setCursorStyle(cursorStyle);
  }
};

// 判断鼠标是否落在可交互节点上，并更新对应的 cursor / borderOption
export const updateCursorOnSelectionBorder = (
  currentX: number,
  currentY: number,
  context: CanvasRenderingContext2D
) => {
  let flag = false;
  context.beginPath();
  for (let i = 0; i < drawingDataStore.selectionBorderNodes.length; i++) {
    const borderInfo = drawingDataStore.selectionBorderNodes[i];
    context.rect(
      borderInfo.x,
      borderInfo.y,
      borderInfo.width,
      borderInfo.height
    );
    if (
      context.isPointInPath(
        currentX * drawingDataStore.dpr,
        currentY * drawingDataStore.dpr
      )
    ) {
      applyCursorStyle(borderInfo.index);
      drawingDataStore.updateBorderOption(borderInfo.option);
      flag = true;
      break;
    }
  }
  // 更新鼠标是否处于裁剪框内
  drawingDataStore.updateMouseInsideCropBox(flag);
  context.closePath();
  if (!flag) {
    screenDomStore.setCursorStyle("default");
    drawingDataStore.updateBorderOption(null);
  }
};

// 将临时矩形渲染到画布上，并同步到 store，供后续逻辑读取
export const renderTempSelectionBounds = (
  bounds: TempSelectionBounds,
  context: CanvasRenderingContext2D,
  controller: HTMLCanvasElement,
  screenShotImageController: HTMLCanvasElement
) => {
  const tempGraphPosition = drawCutOutBox(
    bounds.startX,
    bounds.startY,
    bounds.width,
    bounds.height,
    context,
    cropBoxStore.borderSize,
    controller,
    screenShotImageController
  ) as CropBoxRenderBounds;

  drawingDataStore.updateTempGraphPosition(
    tempGraphPosition.startX,
    tempGraphPosition.startY,
    tempGraphPosition.width,
    tempGraphPosition.height
  );
};
