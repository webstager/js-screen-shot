import drawingDataStore from "@/store/DrawingDataStore";
import cropBoxStore from "@/store/CropBoxStore";
import screenDomStore from "@/store/dom/ScreenDomStore";
import {
  getMousePositionOnCornerInRectangle,
  getMouseRectangleCursorStyle,
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
  getCircleHandleCursor,
  getMousePositionOnCircleHandle,
  isMouseInsideEllipse,
  normalizeEllipseBounds
} from "@/lib/features/canvas/drawing/DrawCircle";
import {
  getArrowBoundingRect,
  getMousePositionOnArrowHandle,
  isMouseOnArrow
} from "@/lib/features/canvas/utils/ArrowUtils";
import {
  isCustomCanvasElementSnapshot,
  isMouseInCustomCanvasElement
} from "@/lib/shared/canvas/CustomCanvasElementUtils";
import { ARROW_HIT_TOLERANCE } from "@/lib/constants/canvasTools";

export const handleMouseMoveOnElement = (
  elementId: string | null,
  mouseX: number,
  mouseY: number,
  dotRadius: number
) => {
  if (elementId != null) {
    const canvasElement = drawingDataStore.getCanvasElement(elementId);
    switch (canvasElement?.type) {
      case "square":
        if (canvasElement?.element == null) break;
        const squareElement = canvasElement.element as SquareElement;
        const operateIndex = getMousePositionOnCornerInRectangle(
          mouseX,
          mouseY,
          squareElement.x,
          squareElement.y,
          squareElement.width,
          squareElement.height,
          dotRadius
        );
        if (
          operateIndex != null &&
          drawingDataStore.activeElementId == elementId
        ) {
          drawingDataStore.updateRectOperateIndex(operateIndex);
          const styleTxt = getMouseRectangleCursorStyle(operateIndex);
          if (styleTxt != null) {
            screenDomStore.setCursorStyle(styleTxt);
          }
          return;
        }
        break;
      case "round":
        if (canvasElement?.element == null) break;
        const roundElement = canvasElement.element as RoundElement;
        const roundOperateIndex = getMousePositionOnCircleHandle(
          mouseX,
          mouseY,
          {
            x: roundElement.x,
            y: roundElement.y,
            width: roundElement.width,
            height: roundElement.height
          },
          dotRadius
        );
        if (
          roundOperateIndex != null &&
          drawingDataStore.activeElementId == elementId
        ) {
          drawingDataStore.updateRectOperateIndex(roundOperateIndex);
          const cursorStyle = getCircleHandleCursor(roundOperateIndex);
          if (cursorStyle != null) {
            screenDomStore.setCursorStyle(cursorStyle);
          }
          return;
        }
        break;
      case "right-top":
        if (canvasElement?.element == null) break;
        const arrowElement = canvasElement.element as
          | LineArrowElement
          | ArrowElement;
        const arrowHandleIndex = getMousePositionOnArrowHandle(
          mouseX,
          mouseY,
          arrowElement,
          dotRadius
        );
        if (
          arrowHandleIndex != null &&
          drawingDataStore.activeElementId == elementId
        ) {
          drawingDataStore.updateRectOperateIndex(arrowHandleIndex);
          screenDomStore.setCursorStyle("crosshair");
          return;
        }
        const arrowTolerance = Math.max(
          arrowElement.borderWidth,
          dotRadius,
          ARROW_HIT_TOLERANCE
        );
        if (isMouseOnArrow(mouseX, mouseY, arrowElement, arrowTolerance)) {
          screenDomStore.setCursorStyle("move");
          drawingDataStore.updateActiveElementId(elementId);
          return;
        }
        break;
      case "text":
        if (canvasElement?.element == null) break;
        const textElement = canvasElement.element as TextElement;
        const isInsideText = isMouseInsideRectangle(
          {
            startX: textElement.x,
            startY: textElement.y,
            width: textElement.width,
            height: textElement.height
          },
          { mouseX, mouseY }
        );
        if (isInsideText) {
          screenDomStore.setCursorStyle("move");
          drawingDataStore.updateActiveElementId(canvasElement.id);
          return;
        }
        break;
      case "custom":
        if (canvasElement?.element == null) break;
        const customElement = canvasElement.element as CustomCanvasElement;
        if (isMouseInCustomCanvasElement(customElement, mouseX, mouseY)) {
          screenDomStore.setCursorStyle("move");
          drawingDataStore.updateActiveElementId(canvasElement.id);
          return;
        }
        break;
      default:
        if (isCustomCanvasElementSnapshot(canvasElement)) {
          const customElement = canvasElement.element as CustomCanvasElement;
          if (isMouseInCustomCanvasElement(customElement, mouseX, mouseY)) {
            screenDomStore.setCursorStyle("move");
            drawingDataStore.updateActiveElementId(canvasElement.id);
            return;
          }
        }
        break;
    }
    screenDomStore.setCursorStyle("move");
    drawingDataStore.updateActiveElementId(elementId);
    return;
  }
  screenDomStore.setCursorStyle("default");
  drawingDataStore.updateActiveElementId(null);
  drawingDataStore.updateRectOperateIndex(null);
};

export const calculateElementDragOffset = (
  mouseDownX: number,
  mouseDownY: number,
  elementId: string | null
) => {
  let dragOffset = { x: 0, y: 0 };
  const canvasElement = drawingDataStore.getCanvasElement(elementId ?? "");
  if (canvasElement && canvasElement.element != null) {
    switch (canvasElement.type) {
      case "square":
        const {
          x: mouseX,
          y: mouseY,
          width,
          height,
          borderWidth
        } = canvasElement.element as SquareElement;
        if (
          isMouseInRectangle(
            cropBoxStore.drawGraphPosition.startX,
            cropBoxStore.drawGraphPosition.startY,
            { x: mouseX, y: mouseY, width, height },
            borderWidth
          )
        ) {
          dragOffset = { x: mouseDownX - mouseX, y: mouseDownY - mouseY };
        }
        break;
      case "round":
        const {
          x: roundX,
          y: roundY,
          width: roundW,
          height: roundH
        } = canvasElement.element as RoundElement;
        const normalizedEllipse = normalizeEllipseBounds({
          x: roundX,
          y: roundY,
          width: roundW,
          height: roundH
        });
        if (isMouseInsideEllipse(mouseDownX, mouseDownY, normalizedEllipse)) {
          dragOffset = {
            x: mouseDownX - normalizedEllipse.x,
            y: mouseDownY - normalizedEllipse.y
          };
        }
        break;
      case "right-top":
        const arrowElement = canvasElement.element as
          | LineArrowElement
          | ArrowElement;
        const arrowTolerance = Math.max(
          arrowElement.borderWidth,
          arrowElement.dotRadius ?? 0,
          ARROW_HIT_TOLERANCE
        );
        if (
          isMouseOnArrow(mouseDownX, mouseDownY, arrowElement, arrowTolerance)
        ) {
          const arrowBounding = getArrowBoundingRect(arrowElement);
          dragOffset = {
            x: mouseDownX - arrowBounding.x,
            y: mouseDownY - arrowBounding.y
          };
        }
        break;
      case "text":
        const textElement = canvasElement.element as TextElement;
        if (
          isMouseInsideRectangle(
            {
              startX: textElement.x,
              startY: textElement.y,
              width: textElement.width,
              height: textElement.height
            },
            { mouseX: mouseDownX, mouseY: mouseDownY }
          )
        ) {
          dragOffset = {
            x: mouseDownX - textElement.x,
            y: mouseDownY - textElement.y
          };
        }
        break;
      case "brush":
        const brushElement = canvasElement.element as PencilElement;
        if (
          isMouseInsideRectangle(
            {
              startX: brushElement.x,
              startY: brushElement.y,
              width: Math.max(brushElement.width, brushElement.size),
              height: Math.max(brushElement.height, brushElement.size)
            },
            { mouseX: mouseDownX, mouseY: mouseDownY }
          )
        ) {
          dragOffset = {
            x: mouseDownX - brushElement.x,
            y: mouseDownY - brushElement.y
          };
        }
        break;
      case "custom":
        const customElement = canvasElement.element as CustomCanvasElement;
        if (isMouseInCustomCanvasElement(customElement, mouseDownX, mouseDownY)) {
          dragOffset = {
            x: mouseDownX - customElement.x,
            y: mouseDownY - customElement.y
          };
        }
        break;
      default:
        if (isCustomCanvasElementSnapshot(canvasElement)) {
          const customElement = canvasElement.element as CustomCanvasElement;
          if (
            isMouseInCustomCanvasElement(customElement, mouseDownX, mouseDownY)
          ) {
            dragOffset = {
              x: mouseDownX - customElement.x,
              y: mouseDownY - customElement.y
            };
          }
        }
        break;
    }
  }
  return dragOffset;
};
