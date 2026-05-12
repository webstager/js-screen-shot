import drawingDataStore from "@/store/DrawingDataStore";
import toolBarStore from "@/store/ToolBarStore";
import screenDomStore from "@/store/dom/ScreenDomStore";
import screenShotCanvasStore from "@/store/ScreenShotCanvasStore";
import { clearCanvasSurface } from "@/lib/shared/canvas/CanvasSurface";
import { zoomCutOutBoxPosition } from "@/lib/shared/canvas/ZoomCutOutBoxPosition";
import {
  CropBoxBounds,
  CropBoxResizeState
} from "@/lib/type/components/cropBox";
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
  isMouseInsideRectangle,
  getScaleIndex
} from "@/lib/features/canvas/utils/ShapeUtils";
import {
  normalizeEllipseBounds,
  resizeEllipse
} from "@/lib/features/canvas/drawing/DrawCircle";
import {
  getArrowBoundingRect,
  moveArrowElement,
  resizeArrowElement
} from "@/lib/features/canvas/utils/ArrowUtils";
import {
  isCustomCanvasElementSnapshot,
  moveCustomCanvasElement,
  resizeCustomCanvasElement
} from "@/lib/shared/canvas/CustomCanvasElementUtils";
import { TOOL_HANDLE_RADIUS_MULTIPLIER } from "@/lib/constants/canvasTools";

const resolveCanvasElement = (elementId: string | null) => {
  const targetId = elementId ?? drawingDataStore.activeElementId ?? null;
  if (targetId == null) return null;
  return (
    drawingDataStore.canvasElements.find(item => item.id === targetId) ?? null
  );
};

export const resizeCanvasElementOnCanvas = (
  mouseX: number,
  mouseY: number,
  elementId: string | null
) => {
  if (
    !isMouseInsideRectangle(drawingDataStore.tempGraphPosition, {
      mouseX,
      mouseY
    })
  ) {
    return;
  }
  const targetElement = resolveCanvasElement(elementId);
  if (targetElement == null || screenShotCanvasStore.screenShotCanvas == null) {
    return;
  }

  drawingDataStore.updateDrawStatus(true);

  switch (targetElement.type) {
    case "square": {
      if (drawingDataStore.rectOperateIndex == null) return;
      const borderIndex = getScaleIndex(drawingDataStore.rectOperateIndex);
      if (borderIndex == null) return;
      const squareElement = targetElement.element as SquareElement | null;
      if (squareElement == null) return;
      const { x: rectX, y: rectY, width: rectW, height: rectH } = squareElement;
      const newPosition = zoomCutOutBoxPosition(
        mouseX,
        mouseY,
        rectX,
        rectY,
        rectW,
        rectH,
        borderIndex
      ) as CropBoxResizeState;
      drawingDataStore.updateCanvasElement({
        id: targetElement.id,
        x: newPosition.tempStartX,
        y: newPosition.tempStartY,
        width: newPosition.tempWidth,
        height: newPosition.tempHeight,
        color: toolBarStore.selectedColor || squareElement.color,
        borderWidth: toolBarStore.penSize || squareElement.borderWidth
      });
      break;
    }
    case "round": {
      if (drawingDataStore.rectOperateIndex == null) return;
      const roundElement = targetElement.element as RoundElement | null;
      if (roundElement == null) return;
      const resizedBounds = resizeEllipse(
        roundElement.x,
        roundElement.y,
        roundElement.width,
        roundElement.height,
        drawingDataStore.rectOperateIndex,
        mouseX,
        mouseY
      );
      drawingDataStore.updateCanvasElement({
        id: targetElement.id,
        x: resizedBounds.x,
        y: resizedBounds.y,
        width: resizedBounds.width,
        height: resizedBounds.height,
        color: toolBarStore.selectedColor || roundElement.color,
        borderWidth: toolBarStore.penSize || roundElement.borderWidth,
        drawNode: roundElement.drawNode,
        dotRadius:
          roundElement.dotRadius ??
          toolBarStore.penSize * TOOL_HANDLE_RADIUS_MULTIPLIER
      });
      break;
    }
    case "right-top": {
      if (drawingDataStore.rectOperateIndex == null) return;
      const arrowElement = targetElement.element as
        | LineArrowElement
        | ArrowElement;
      if (arrowElement == null) return;
      drawingDataStore.updateCanvasElement(
        resizeArrowElement(
          arrowElement,
          drawingDataStore.rectOperateIndex,
          mouseX,
          mouseY,
          drawingDataStore.tempGraphPosition
        )
      );
      break;
    }
    case "custom": {
      if (drawingDataStore.rectOperateIndex == null) return;
      const customElement = targetElement.element as CustomCanvasElement | null;
      if (customElement == null) return;
      drawingDataStore.updateCanvasElement(
        resizeCustomCanvasElement(
          customElement,
          drawingDataStore.rectOperateIndex,
          { x: mouseX, y: mouseY },
          drawingDataStore.tempGraphPosition
        )
      );
      break;
    }
    default:
      if (isCustomCanvasElementSnapshot(targetElement)) {
        if (drawingDataStore.rectOperateIndex == null) return;
        drawingDataStore.updateCanvasElement(
          resizeCustomCanvasElement(
            targetElement.element as CustomCanvasElement,
            drawingDataStore.rectOperateIndex,
            { x: mouseX, y: mouseY },
            drawingDataStore.tempGraphPosition
          )
        );
      }
      break;
  }

  clearCanvasSurface();
  drawingDataStore.redrawCanvasElements();
};

export const moveCanvasElementOnCanvas = (
  mouseX: number,
  mouseY: number,
  dragOffset: { x: number; y: number },
  elementId: string | null
) => {
  const targetElement = resolveCanvasElement(elementId);
  if (targetElement == null) return;
  drawingDataStore.updateDrawStatus(true);
  clearCanvasSurface();

  switch (targetElement.type) {
    case "square": {
      const curElement = targetElement.element as SquareElement | null;
      if (curElement == null) break;
      const newPosition = calculateNewRectanglePosition(
        curElement,
        { x: mouseX, y: mouseY },
        drawingDataStore.tempGraphPosition,
        dragOffset
      );
      drawingDataStore.updateCanvasElement({
        id: targetElement.id,
        x: newPosition.mouseX,
        y: newPosition.mouseY,
        width: newPosition.width,
        height: newPosition.height,
        color: toolBarStore.selectedColor || curElement.color,
        borderWidth: toolBarStore.penSize || curElement.borderWidth
      });
      break;
    }
    case "round": {
      const curElement = targetElement.element as RoundElement | null;
      if (curElement == null) break;
      const roundPosition = calculateNewEllipsePosition(
        curElement,
        { x: mouseX, y: mouseY },
        drawingDataStore.tempGraphPosition,
        dragOffset
      );
      drawingDataStore.updateCanvasElement({
        id: targetElement.id,
        x: roundPosition.mouseX,
        y: roundPosition.mouseY,
        width: roundPosition.width,
        height: roundPosition.height,
        color: toolBarStore.selectedColor || curElement.color,
        borderWidth: toolBarStore.penSize || curElement.borderWidth
      });
      break;
    }
    case "right-top": {
      const arrowElement = targetElement.element as
        | LineArrowElement
        | ArrowElement;
      if (arrowElement == null) break;
      const arrowBounding = getArrowBoundingRect(arrowElement);
      const targetX = mouseX - dragOffset.x;
      const targetY = mouseY - dragOffset.y;
      drawingDataStore.updateCanvasElement(
        moveArrowElement(
          arrowElement,
          targetX - arrowBounding.x,
          targetY - arrowBounding.y,
          drawingDataStore.tempGraphPosition
        )
      );
      break;
    }
    case "text": {
      const curElement = targetElement.element as TextElement | null;
      if (curElement == null) break;
      const newPosition = calculateNewRectanglePosition(
        curElement,
        { x: mouseX, y: mouseY },
        drawingDataStore.tempGraphPosition,
        dragOffset
      );
      drawingDataStore.updateCanvasElement({
        ...curElement,
        id: targetElement.id,
        x: newPosition.mouseX,
        y: newPosition.mouseY,
        color: toolBarStore.selectedColor || curElement.color
      });
      screenDomStore.setCursorStyle("move");
      break;
    }
    case "brush": {
      const brushElement = targetElement.element as PencilElement | null;
      if (brushElement == null) break;
      const originalPoints = brushElement.points ?? [];
      const newPosition = calculateNewRectanglePosition(
        {
          x: brushElement.x,
          y: brushElement.y,
          width: brushElement.width,
          height: brushElement.height
        },
        { x: mouseX, y: mouseY },
        drawingDataStore.tempGraphPosition,
        dragOffset
      );
      const deltaX = newPosition.mouseX - brushElement.x;
      const deltaY = newPosition.mouseY - brushElement.y;
      drawingDataStore.updateCanvasElement({
        ...brushElement,
        id: targetElement.id,
        x: newPosition.mouseX,
        y: newPosition.mouseY,
        points: originalPoints.map(point => ({
          x: point.x + deltaX,
          y: point.y + deltaY
        }))
      });
      screenDomStore.setCursorStyle("move");
      break;
    }
    case "custom": {
      const customElement = targetElement.element as CustomCanvasElement | null;
      if (customElement == null) break;
      const delta = {
        x: mouseX - dragOffset.x - customElement.x,
        y: mouseY - dragOffset.y - customElement.y
      };
      drawingDataStore.updateCanvasElement(
        moveCustomCanvasElement(
          customElement,
          delta,
          drawingDataStore.tempGraphPosition
        )
      );
      screenDomStore.setCursorStyle("move");
      break;
    }
    default:
      if (isCustomCanvasElementSnapshot(targetElement)) {
        const customElement = targetElement.element as CustomCanvasElement;
        const delta = {
          x: mouseX - dragOffset.x - customElement.x,
          y: mouseY - dragOffset.y - customElement.y
        };
        drawingDataStore.updateCanvasElement(
          moveCustomCanvasElement(
            customElement,
            delta,
            drawingDataStore.tempGraphPosition
          )
        );
        screenDomStore.setCursorStyle("move");
      }
      break;
  }

  drawingDataStore.redrawCanvasElements();
};

export const calculateNewRectanglePosition = (
  rectangle: Pick<SquareElement, "x" | "y" | "width" | "height">,
  currentPoint: { x: number; y: number },
  clipArea: CropBoxBounds,
  dragOffset: { x: number; y: number }
) => {
  let newX = currentPoint.x - dragOffset.x;
  let newY = currentPoint.y - dragOffset.y;
  newX = Math.max(clipArea.startX, newX);
  newX = Math.min(clipArea.startX + clipArea.width - rectangle.width, newX);
  newY = Math.max(clipArea.startY, newY);
  newY = Math.min(clipArea.startY + clipArea.height - rectangle.height, newY);
  return {
    ...rectangle,
    mouseX: newX,
    mouseY: newY
  };
};

export const calculateNewEllipsePosition = (
  ellipse: RoundElement,
  currentPoint: { x: number; y: number },
  clipArea: CropBoxBounds,
  dragOffset: { x: number; y: number }
) => {
  const width = ellipse.width;
  const height = ellipse.height;
  let newX = currentPoint.x - dragOffset.x;
  let newY = currentPoint.y - dragOffset.y;
  newX = Math.max(clipArea.startX, newX);
  newX = Math.min(clipArea.startX + clipArea.width - width, newX);
  newY = Math.max(clipArea.startY, newY);
  newY = Math.min(clipArea.startY + clipArea.height - height, newY);
  return {
    ...ellipse,
    mouseX: newX,
    mouseY: newY,
    centerX: newX + width / 2,
    centerY: newY + height / 2
  };
};
