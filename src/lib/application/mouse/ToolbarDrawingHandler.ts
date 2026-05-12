import cropBoxStore from "@/store/CropBoxStore";
import drawingDataStore from "@/store/DrawingDataStore";
import toolBarStore from "@/store/ToolBarStore";
import screenDomStore from "@/store/dom/ScreenDomStore";
import screenShotCanvasStore from "@/store/ScreenShotCanvasStore";
import userParamStore from "@/store/UserParamStore";
import { showCanvasLastHistory } from "@/lib/application/LoadCoreComponents";
import { emitCustomToolMouseMove } from "@/lib/application/mouse/CustomToolEventBridge";
import { getDrawBoundaryStatus } from "@/lib/features/canvas/calculations";
import { DrawArrow } from "@/lib/features/canvas/drawing/DrawArrow";
import { drawCircle, normalizeEllipseBounds } from "@/lib/features/canvas/drawing/DrawCircle";
import { drawLineArrow } from "@/lib/features/canvas/drawing/DrawLineArrow";
import { drawMosaic } from "@/lib/features/canvas/drawing/DrawMosaic";
import { drawPencil } from "@/lib/features/canvas/drawing/DrawPencil";
import { drawRectangle } from "@/lib/features/canvas/drawing/DrawRectangle";
import {
  moveCanvasElementOnCanvas,
  resizeCanvasElementOnCanvas,
  syncToolbarWithElement
} from "@/lib/shared/canvas/CanvasElementEditUtils";
import {
  ArrowElement,
  CanvasElement,
  CanvasPoint,
  LineArrowElement,
  MosaicElement,
  PencilElement,
  RoundElement,
  SquareElement
} from "@/lib/type/editor/canvasElements";
import { MouseMoveMetrics, ToolbarDrawingContext } from "@/lib/type/mouse/CanvasMouseMoveTypes";
import {
  ARROW_LINE_DEFAULT_SLASH_LENGTH,
  ARROW_LINE_DEFAULT_THETA,
  MOSAIC_PEN_OFFSET
} from "@/lib/constants/canvasTools";

const handleElementTransform = (
  currentX: number,
  currentY: number,
  dragOffset: { x: number; y: number },
  prevElementId: string | null,
  transformingExisting: boolean
) => {
  if (!transformingExisting) {
    return false;
  }

  const targetId = prevElementId ?? drawingDataStore.activeElementId;
  if (targetId != null) {
    const elementSnapshot = drawingDataStore.getCanvasElement(targetId);
    syncToolbarWithElement(elementSnapshot);
  }

  const isResizing = drawingDataStore.rectOperateIndex != null;

  if (!isResizing) {
    moveCanvasElementOnCanvas(currentX, currentY, dragOffset, prevElementId);
    return true;
  }

  resizeCanvasElementOnCanvas(currentX, currentY, prevElementId);
  return true;
};

const shouldTransformExistingElement = (
  prevElementId: string | null,
  transformingExisting: boolean
) => {
  if (transformingExisting) {
    return true;
  }
  if (prevElementId == null || screenDomStore.mousePointer !== "move") {
    return false;
  }
  if (toolBarStore.toolName !== "text") {
    return false;
  }
  return drawingDataStore.getCanvasElement(prevElementId) != null;
};

const syncCanvasHistory = () => {
  const isMosaicTool = toolBarStore.toolName === "mosaicPen";
  if (!isMosaicTool) {
    showCanvasLastHistory();
    drawingDataStore.updateDrawStatus(true);
    return;
  }
  if (!drawingDataStore.drawStatus) {
    showCanvasLastHistory();
    drawingDataStore.updateDrawStatus(true);
  }
};

const appendPointIfNeeded = (points: CanvasPoint[], point: CanvasPoint) => {
  const lastPoint = points[points.length - 1];
  if (lastPoint && lastPoint.x === point.x && lastPoint.y === point.y) {
    return false;
  }
  points.push(point);
  return true;
};

const calculateBrushBounds = (points: CanvasPoint[], brushSize: number) => {
  const halfSize = brushSize / 2;
  let minX = points[0].x - halfSize;
  let maxX = points[0].x + halfSize;
  let minY = points[0].y - halfSize;
  let maxY = points[0].y + halfSize;
  for (let i = 1; i < points.length; i++) {
    const point = points[i];
    const left = point.x - halfSize;
    const right = point.x + halfSize;
    const top = point.y - halfSize;
    const bottom = point.y + halfSize;
    minX = Math.min(minX, left);
    maxX = Math.max(maxX, right);
    minY = Math.min(minY, top);
    maxY = Math.max(maxY, bottom);
  }
  return {
    x: minX,
    y: minY,
    width: Math.max(maxX - minX, brushSize),
    height: Math.max(maxY - minY, brushSize)
  };
};

const calculateMosaicBounds = (points: CanvasPoint[], size: number) => {
  let minX = points[0].x;
  let maxX = points[0].x + size;
  let minY = points[0].y;
  let maxY = points[0].y + size;
  for (let i = 1; i < points.length; i++) {
    const point = points[i];
    minX = Math.min(minX, point.x);
    minY = Math.min(minY, point.y);
    maxX = Math.max(maxX, point.x + size);
    maxY = Math.max(maxY, point.y + size);
  }
  return {
    x: minX,
    y: minY,
    width: Math.max(maxX - minX, size),
    height: Math.max(maxY - minY, size)
  };
};

const updateBrushElementSnapshot = ({
  startX,
  startY,
  currentX,
  currentY
}: MouseMoveMetrics) => {
  const activeElementId = drawingDataStore.activeElementId;
  if (activeElementId == null) return;
  const elementSnapshot = drawingDataStore.getCanvasElement(activeElementId);
  const existingElement = elementSnapshot?.element as PencilElement | null;
  const brushSize = toolBarStore.penSize;
  const color = toolBarStore.selectedColor;
  const points = existingElement?.points ? [...existingElement.points] : [];
  let hasChanged = false;
  if (points.length === 0) {
    points.push({ x: startX, y: startY });
    hasChanged = true;
  }
  if (
    appendPointIfNeeded(points, {
      x: currentX,
      y: currentY
    })
  ) {
    hasChanged = true;
  }
  if (!hasChanged) {
    return;
  }
  const bounds = calculateBrushBounds(points, brushSize);
  const updatedElement: PencilElement = {
    id: activeElementId,
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
    size: brushSize,
    color,
    points,
    drawNode: existingElement?.drawNode,
    dotRadius: existingElement?.dotRadius
  };
  drawingDataStore.updateCanvasElement(updatedElement);
};

const updateMosaicElementSnapshot = ({
  startX,
  startY,
  currentX,
  currentY
}: MouseMoveMetrics) => {
  const activeElementId = drawingDataStore.activeElementId;
  if (activeElementId == null) return;
  const elementSnapshot = drawingDataStore.getCanvasElement(activeElementId);
  const existingElement = elementSnapshot?.element as MosaicElement | null;
  const mosaicSize = toolBarStore.mosaicPenSize;
  const blur = drawingDataStore.degreeOfBlur;
  const color = existingElement?.color ?? toolBarStore.selectedColor;
  const points = existingElement?.points ? [...existingElement.points] : [];
  const offsetPoint = (x: number, y: number): CanvasPoint => ({
    x: x - MOSAIC_PEN_OFFSET,
    y: y - MOSAIC_PEN_OFFSET
  });
  let hasChanged = false;
  if (points.length === 0) {
    points.push(offsetPoint(startX, startY));
    hasChanged = true;
  }
  if (appendPointIfNeeded(points, offsetPoint(currentX, currentY))) {
    hasChanged = true;
  }
  if (!hasChanged) {
    return;
  }
  const bounds = calculateMosaicBounds(points, mosaicSize);
  const updatedElement: MosaicElement = {
    id: activeElementId,
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
    size: mosaicSize,
    degreeOfBlur: blur,
    color,
    points,
    drawNode: existingElement?.drawNode,
    dotRadius: existingElement?.dotRadius
  };
  drawingDataStore.updateCanvasElement(updatedElement);
};

const drawActiveTool = ({
  startX,
  startY,
  currentX,
  currentY,
  tempWidth,
  tempHeight,
  drawArrow
}: MouseMoveMetrics & { drawArrow: DrawArrow }) => {
  const canvas = screenShotCanvasStore.screenShotCanvas;
  if (canvas == null) return;
  const color = toolBarStore.selectedColor;
  const penSize = toolBarStore.penSize;

  switch (toolBarStore.toolName) {
    case "square":
      drawRectangle(startX, startY, tempWidth, tempHeight, color, penSize, canvas);
      break;
    case "round":
      drawCircle(canvas, currentX, currentY, startX, startY, penSize, color);
      break;
    case "right-top":
      if (userParamStore.useRatioArrow) {
        drawLineArrow(
          canvas,
          startX,
          startY,
          currentX,
          currentY,
          ARROW_LINE_DEFAULT_THETA,
          ARROW_LINE_DEFAULT_SLASH_LENGTH,
          penSize,
          color
        );
      } else {
        drawArrow.draw(canvas, startX, startY, currentX, currentY, color, penSize);
      }
      break;
    case "brush":
      drawPencil(canvas, currentX, currentY, penSize, color);
      break;
    case "mosaicPen":
      drawMosaic(
        currentX - MOSAIC_PEN_OFFSET,
        currentY - MOSAIC_PEN_OFFSET,
        toolBarStore.mosaicPenSize,
        drawingDataStore.degreeOfBlur,
        canvas
      );
      break;
    default:
      break;
  }
};

const buildElementSnapshot = (
  activeElementId: string,
  startX: number,
  startY: number,
  currentX: number,
  currentY: number,
  tempWidth: number,
  tempHeight: number
): CanvasElement | null => {
  const color = toolBarStore.selectedColor;
  const borderWidth = toolBarStore.penSize;

  switch (toolBarStore.toolName) {
    case "square":
      return {
        id: activeElementId,
        x: Math.min(startX, currentX),
        y: Math.min(startY, currentY),
        width: Math.abs(tempWidth),
        height: Math.abs(tempHeight),
        color,
        borderWidth
      } as SquareElement;
    case "round": {
      const ellipseBounds = normalizeEllipseBounds({
        x: startX,
        y: startY,
        width: tempWidth,
        height: tempHeight
      });
      return {
        id: activeElementId,
        x: ellipseBounds.x,
        y: ellipseBounds.y,
        width: ellipseBounds.width,
        height: ellipseBounds.height,
        color,
        borderWidth
      } as RoundElement;
    }
    case "right-top": {
      const startPoint = { x: startX, y: startY };
      const endPoint = { x: currentX, y: currentY };
      const minArrowX = Math.min(startPoint.x, endPoint.x);
      const minArrowY = Math.min(startPoint.y, endPoint.y);
      const arrowWidth = Math.abs(endPoint.x - startPoint.x);
      const arrowHeight = Math.abs(endPoint.y - startPoint.y);

      if (userParamStore.useRatioArrow) {
        return {
          id: activeElementId,
          arrowType: "line",
          x: minArrowX,
          y: minArrowY,
          width: arrowWidth,
          height: arrowHeight,
          color,
          borderWidth,
          startX: startPoint.x,
          startY: startPoint.y,
          endX: endPoint.x,
          endY: endPoint.y,
          x2: endPoint.x,
          y2: endPoint.y,
          theta: ARROW_LINE_DEFAULT_THETA,
          slashLength: ARROW_LINE_DEFAULT_SLASH_LENGTH
        } as LineArrowElement;
      }
      return {
        id: activeElementId,
        arrowType: "filled",
        x: minArrowX,
        y: minArrowY,
        width: arrowWidth,
        height: arrowHeight,
        color,
        borderWidth,
        startX: startPoint.x,
        startY: startPoint.y,
        endX: endPoint.x,
        endY: endPoint.y,
        x2: endPoint.x,
        y2: endPoint.y
      } as ArrowElement;
    }
    default:
      return null;
  }
};

const updateActiveElementSnapshot = ({
  startX,
  startY,
  currentX,
  currentY,
  tempWidth,
  tempHeight
}: MouseMoveMetrics) => {
  if (toolBarStore.toolName === "brush") {
    updateBrushElementSnapshot({
      startX,
      startY,
      currentX,
      currentY,
      tempWidth,
      tempHeight
    });
    return;
  }
  if (toolBarStore.toolName === "mosaicPen") {
    updateMosaicElementSnapshot({
      startX,
      startY,
      currentX,
      currentY,
      tempWidth,
      tempHeight
    });
    return;
  }
  const activeElementId = drawingDataStore.activeElementId;
  if (activeElementId == null) return;
  const elementToUpdate = buildElementSnapshot(
    activeElementId,
    startX,
    startY,
    currentX,
    currentY,
    tempWidth,
    tempHeight
  );
  if (elementToUpdate != null) {
    drawingDataStore.updateCanvasElement(elementToUpdate);
  }
};

export const handleToolbarDrawing = ({
  startX,
  startY,
  currentX,
  currentY,
  tempWidth,
  tempHeight,
  event,
  drawArrow,
  dragOffset,
  prevElementId,
  transformingExisting = false
}: ToolbarDrawingContext) => {
  if (screenShotCanvasStore.screenShotCanvas == null) return;
  if (
    handleElementTransform(
      currentX,
      currentY,
      dragOffset,
      prevElementId,
      shouldTransformExistingElement(prevElementId, transformingExisting)
    )
  ) {
    return;
  }

  const cutBoxPosition = cropBoxStore.cutOutBoxPosition;
  const isStartWithinBounds = getDrawBoundaryStatus(startX, startY, cutBoxPosition);
  const isCurrentWithinBounds = getDrawBoundaryStatus(currentX, currentY, cutBoxPosition);
  if (!isStartWithinBounds || !isCurrentWithinBounds) {
    return;
  }

  syncCanvasHistory();
  emitCustomToolMouseMove(event, {
    startX,
    startY,
    currentX,
    currentY
  });

  drawActiveTool({
    startX,
    startY,
    currentX,
    currentY,
    tempWidth,
    tempHeight,
    drawArrow
  });
  updateActiveElementSnapshot({
    startX,
    startY,
    currentX,
    currentY,
    tempWidth,
    tempHeight
  });
};
