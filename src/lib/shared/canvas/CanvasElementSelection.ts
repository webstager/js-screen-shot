import drawingDataStore from "@/store/DrawingDataStore";
import cropBoxStore from "@/store/CropBoxStore";
import screenDomStore from "@/store/dom/ScreenDomStore";
import { clearCanvasSurface } from "@/lib/shared/canvas/CanvasSurface";
import { syncToolbarWithElement } from "@/lib/shared/canvas/CanvasElementToolbarSync";
import { addHistory } from "@/lib/features/canvas/state/AddHistoryData";
import { CanvasElementSnapshot } from "@/lib/type/components/canvas";
import {
  isMouseInRectangle,
  isMouseInsideRectangle
} from "@/lib/features/canvas/utils/ShapeUtils";
import {
  ArrowElement,
  CustomCanvasElement,
  LineArrowElement,
  PencilElement,
  RoundElement,
  SquareElement,
  TextElement
} from "@/lib/type/editor/canvasElements";
import {
  isMouseOnCircleBorder,
  normalizeEllipseBounds
} from "@/lib/features/canvas/drawing/DrawCircle";
import {
  isMouseOnArrow,
  updateArrowDrawNodeState
} from "@/lib/features/canvas/utils/ArrowUtils";
import {
  isCustomCanvasElementSnapshot,
  isMouseInCustomCanvasElement
} from "@/lib/shared/canvas/CustomCanvasElementUtils";
import { ARROW_HIT_TOLERANCE } from "@/lib/constants/canvasTools";
import { logger } from "@/lib/utils/Logger";

export const deleteActiveCanvasElement = () => {
  const activeElementId = drawingDataStore.activeElementId;
  if (activeElementId == null) {
    return false;
  }
  drawingDataStore.removeElement(activeElementId);
  drawingDataStore.updateActiveElementId(null);
  drawingDataStore.updateRectOperateIndex(null);
  clearCanvasSurface();
  drawingDataStore.redrawCanvasElements();
  addHistory();
  return true;
};

export const hideCanvasActiveElementBorder = () => {
  const activeElementId = drawingDataStore.activeElementId;
  const hasActiveBorder = drawingDataStore.canvasElements.some(element =>
    Boolean(element.element?.drawNode)
  );
  if (activeElementId == null && !hasActiveBorder) {
    return false;
  }
  drawingDataStore.updateActiveElementId(null);
  drawingDataStore.updateRectOperateIndex(null);
  if (hasActiveBorder) {
    drawingDataStore.resetCanvasElementNodeState();
    clearCanvasSurface();
    drawingDataStore.redrawCanvasElements();
  }
  return true;
};

export const showCanvasActiveElementBorder = (dotRadius: number) => {
  const canvasElement = drawingDataStore.getCanvasElement(
    drawingDataStore.activeElementId ?? ""
  );
  syncToolbarWithElement(canvasElement);
  switch (canvasElement?.type) {
    case "square":
      if (canvasElement.element == null) break;
      const {
        x: mouseX,
        y: mouseY,
        width,
        height,
        borderWidth,
        color
      } = canvasElement.element as SquareElement;
      if (
        isMouseInRectangle(
          cropBoxStore.drawGraphPosition.startX,
          cropBoxStore.drawGraphPosition.startY,
          { x: mouseX, y: mouseY, width, height },
          borderWidth
        )
      ) {
        logger.debug(`当前鼠标处于${canvasElement.id}矩形内`);
        selectCanvasElementBorder(canvasElement.id, dotRadius);
      }
      break;
    case "round":
      if (canvasElement.element == null) break;
      const {
        x: roundX,
        y: roundY,
        width: roundWidth,
        height: roundHeight,
        borderWidth: roundBorderWidth,
        color: roundColor
      } = canvasElement.element as RoundElement;
      const normalizedRound = normalizeEllipseBounds({
        x: roundX,
        y: roundY,
        width: roundWidth,
        height: roundHeight
      });
      if (
        isMouseOnCircleBorder(
          cropBoxStore.drawGraphPosition.startX,
          cropBoxStore.drawGraphPosition.startY,
          normalizedRound,
          roundBorderWidth
        )
      ) {
        selectCanvasElementBorder(canvasElement.id, dotRadius);
      }
      break;
    case "right-top":
      if (canvasElement.element == null) break;
      const arrowElement = canvasElement.element as
        | LineArrowElement
        | ArrowElement;
      if (
        isMouseOnArrow(
          cropBoxStore.drawGraphPosition.startX,
          cropBoxStore.drawGraphPosition.startY,
          arrowElement,
          Math.max(
            arrowElement.borderWidth,
            arrowElement.dotRadius ?? 0,
            ARROW_HIT_TOLERANCE
          )
        )
      ) {
        selectCanvasElementBorder(canvasElement.id, dotRadius);
      }
      break;
    case "text":
      if (canvasElement.element == null) break;
      const textElement = canvasElement.element as TextElement;
      if (
        isMouseInsideRectangle(
          {
            startX: textElement.x,
            startY: textElement.y,
            width: textElement.width,
            height: textElement.height
          },
          {
            mouseX: cropBoxStore.drawGraphPosition.startX,
            mouseY: cropBoxStore.drawGraphPosition.startY
          }
        )
      ) {
        selectCanvasElementBorder(canvasElement.id, dotRadius);
      }
      break;
    case "brush":
      if (canvasElement.element == null) break;
      const brushElement = canvasElement.element as PencilElement;
      if (
        isMouseInsideRectangle(
          {
            startX: brushElement.x,
            startY: brushElement.y,
            width: Math.max(brushElement.width, brushElement.size),
            height: Math.max(brushElement.height, brushElement.size)
          },
          {
            mouseX: cropBoxStore.drawGraphPosition.startX,
            mouseY: cropBoxStore.drawGraphPosition.startY
          }
        )
      ) {
        selectCanvasElementBorder(canvasElement.id, dotRadius);
      }
      break;
    case "custom":
      if (canvasElement.element == null) break;
      const customElement = canvasElement.element as CustomCanvasElement;
      if (
        isMouseInCustomCanvasElement(
          customElement,
          cropBoxStore.drawGraphPosition.startX,
          cropBoxStore.drawGraphPosition.startY
        )
      ) {
        selectCanvasElementBorder(canvasElement.id, dotRadius);
      }
      break;
    default:
      if (isCustomCanvasElementSnapshot(canvasElement)) {
        selectCanvasElementBorder(canvasElement.id, dotRadius);
      }
      break;
  }
};

export const selectCanvasElementBorder = (
  elementId: CanvasElementSnapshot["id"],
  dotRadius: number
) => {
  const canvasElement = drawingDataStore.getCanvasElement(elementId);
  if (canvasElement?.element == null) {
    return false;
  }

  syncToolbarWithElement(canvasElement);
  drawingDataStore.updateActiveElementId(canvasElement.id);
  drawingDataStore.updateRectOperateIndex(null);
  screenDomStore.setCursorStyle("move");
  drawingDataStore.resetCanvasElementNodeState();

  switch (canvasElement.type) {
    case "square": {
      const squareElement = canvasElement.element as SquareElement;
      drawingDataStore.updateCanvasElement({
        ...squareElement,
        id: canvasElement.id,
        drawNode: true,
        dotRadius
      });
      break;
    }
    case "round": {
      const roundElement = canvasElement.element as RoundElement;
      const normalizedRound = normalizeEllipseBounds({
        x: roundElement.x,
        y: roundElement.y,
        width: roundElement.width,
        height: roundElement.height
      });
      drawingDataStore.updateCanvasElement({
        ...roundElement,
        id: canvasElement.id,
        x: normalizedRound.x,
        y: normalizedRound.y,
        width: normalizedRound.width,
        height: normalizedRound.height,
        drawNode: true,
        dotRadius
      });
      break;
    }
    case "right-top": {
      const arrowElement = canvasElement.element as
        | LineArrowElement
        | ArrowElement;
      drawingDataStore.updateCanvasElement(
        updateArrowDrawNodeState(arrowElement, true, dotRadius)
      );
      break;
    }
    case "text": {
      const textElement = canvasElement.element as TextElement;
      drawingDataStore.updateCanvasElement({
        ...textElement,
        id: canvasElement.id,
        drawNode: true,
        dotRadius: 0
      });
      break;
    }
    case "brush": {
      const brushElement = canvasElement.element as PencilElement;
      drawingDataStore.updateCanvasElement({
        ...brushElement,
        id: canvasElement.id,
        drawNode: true,
        dotRadius: 0
      });
      break;
    }
    case "custom": {
      const customElement = canvasElement.element as CustomCanvasElement;
      drawingDataStore.updateCanvasElement({
        ...customElement,
        id: canvasElement.id,
        drawNode: true,
        dotRadius
      });
      break;
    }
    default:
      if (!isCustomCanvasElementSnapshot(canvasElement)) {
        return false;
      }
      drawingDataStore.updateCanvasElement({
        ...(canvasElement.element as CustomCanvasElement),
        id: canvasElement.id,
        drawNode: true,
        dotRadius
      });
      break;
  }

  clearCanvasSurface();
  drawingDataStore.redrawCanvasElements();
  return true;
};
