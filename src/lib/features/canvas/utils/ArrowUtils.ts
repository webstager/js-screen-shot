import { DrawArrow } from "@/lib/features/canvas/drawing/DrawArrow";
import { drawLineArrow } from "@/lib/features/canvas/drawing/DrawLineArrow";
import { CropBoxBounds } from "@/lib/type/components/cropBox";
import {
  ARROW_HIT_TOLERANCE,
  ARROW_LINE_DEFAULT_SLASH_LENGTH,
  ARROW_LINE_DEFAULT_THETA
} from "@/lib/constants/canvasTools";
import { ArrowLikeElement } from "@/lib/type/editor/ArrowLikeElement";

const arrowDrawer = new DrawArrow();

type Point = { x: number; y: number };

// 计算两点间的欧氏距离
const distanceBetweenPoints = (p1: Point, p2: Point) => {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
};

// 将数值限制在给定的最小/最大区间内
const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const isFinitePoint = (point: Point) =>
  Number.isFinite(point.x) && Number.isFinite(point.y);

// 根据元素属性计算箭头的起点与终点坐标
export const getArrowEndpoints = (
  element: ArrowLikeElement
): { start: Point; end: Point } => {
  const start = {
    x: element.startX ?? element.x,
    y: element.startY ?? element.y
  };
  const end = {
    x: element.endX ?? element.x2 ?? element.x + element.width,
    y: element.endY ?? element.y2 ?? element.y + element.height
  };
  return { start, end };
};

// 基于起终点返回箭头的包围盒信息
export const getArrowBoundingRect = (element: ArrowLikeElement) => {
  const { start, end } = getArrowEndpoints(element);
  const minX = Math.min(start.x, end.x);
  const minY = Math.min(start.y, end.y);
  const maxX = Math.max(start.x, end.x);
  const maxY = Math.max(start.y, end.y);

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY
  };
};

// 规范化箭头元素：写回起终点并重新计算位置信息
const normalizeArrowElement = (
  element: ArrowLikeElement,
  start: Point,
  end: Point
) => {
  const bounding = getArrowBoundingRect({
    ...element,
    startX: start.x,
    startY: start.y,
    endX: end.x,
    endY: end.y,
    x2: end.x,
    y2: end.y
  } as ArrowLikeElement);

  return {
    ...element,
    startX: start.x,
    startY: start.y,
    endX: end.x,
    endY: end.y,
    x: bounding.x,
    y: bounding.y,
    width: bounding.width,
    height: bounding.height,
    x2: end.x,
    y2: end.y
  };
};

// 绘制箭头两端的控制点（拖拽手柄）
const drawArrowHandles = (
  context: CanvasRenderingContext2D,
  handles: Point[],
  color: string,
  dotRadius: number
) => {
  handles.forEach(point => {
    context.beginPath();
    context.arc(point.x, point.y, dotRadius, 0, Math.PI * 2);
    context.fillStyle = "#ffffff";
    context.fill();
    context.lineWidth = 1;
    context.strokeStyle = color;
    context.stroke();
  });
};

// 在画布上绘制箭头（支持线型/普通箭头以及控制点）
export const drawArrowElement = (
  context: CanvasRenderingContext2D,
  element: ArrowLikeElement,
  drawHandlesOptions?: { drawState: boolean; dotRadius: number }
) => {
  const { start, end } = getArrowEndpoints(element);
  const color = element.color;
  const borderWidth = element.borderWidth;

  if (element.arrowType === "line") {
    const theta = element.theta ?? ARROW_LINE_DEFAULT_THETA;
    const slashLength = element.slashLength ?? ARROW_LINE_DEFAULT_SLASH_LENGTH;
    drawLineArrow(
      context,
      start.x,
      start.y,
      end.x,
      end.y,
      theta,
      slashLength,
      borderWidth,
      color
    );
  } else {
    arrowDrawer.draw(
      context,
      start.x,
      start.y,
      end.x,
      end.y,
      color,
      borderWidth
    );
  }

  if (drawHandlesOptions?.drawState && drawHandlesOptions.dotRadius) {
    drawArrowHandles(
      context,
      [start, end],
      color,
      drawHandlesOptions.dotRadius
    );
  }
};

// 判断鼠标是否落在箭头控制点上，返回对应索引
export const getMousePositionOnArrowHandle = (
  mouseX: number,
  mouseY: number,
  element: ArrowLikeElement,
  dotRadius: number
): number | null => {
  const { start, end } = getArrowEndpoints(element);
  const tolerance = Math.max(dotRadius, ARROW_HIT_TOLERANCE);

  if (distanceBetweenPoints({ x: mouseX, y: mouseY }, start) <= tolerance) {
    return 0;
  }
  if (distanceBetweenPoints({ x: mouseX, y: mouseY }, end) <= tolerance) {
    return 1;
  }
  return null;
};

// 判断鼠标是否落在箭头线段附近（带容差）
export const isMouseOnArrow = (
  mouseX: number,
  mouseY: number,
  element: ArrowLikeElement,
  tolerance: number = ARROW_HIT_TOLERANCE
) => {
  const { start, end } = getArrowEndpoints(element);
  if (!isFinitePoint(start) || !isFinitePoint(end)) return false;

  const hitTolerance = Math.max(tolerance, 0);
  const minX = Math.min(start.x, end.x) - hitTolerance;
  const minY = Math.min(start.y, end.y) - hitTolerance;
  const maxX = Math.max(start.x, end.x) + hitTolerance;
  const maxY = Math.max(start.y, end.y) + hitTolerance;

  // 先做包围盒粗筛，避免远距离误判
  if (mouseX < minX || mouseX > maxX || mouseY < minY || mouseY > maxY) {
    return false;
  }

  const lineLen = distanceBetweenPoints(start, end);
  if (lineLen === 0) {
    return (
      distanceBetweenPoints({ x: mouseX, y: mouseY }, start) <= hitTolerance
    );
  }

  const numerator = Math.abs(
    (end.x - start.x) * (start.y - mouseY) -
      (start.x - mouseX) * (end.y - start.y)
  );
  const distance = numerator / lineLen;

  if (distance > hitTolerance) return false;

  // 检查鼠标是否处于线段上
  const dotProduct =
    (mouseX - start.x) * (end.x - start.x) +
    (mouseY - start.y) * (end.y - start.y);
  if (dotProduct < 0) return false;
  if (dotProduct > lineLen * lineLen) return false;

  return true;
};

// 根据拖拽的控制点重新计算箭头位置，可受裁剪区域限制
export const resizeArrowElement = (
  element: ArrowLikeElement,
  handleIndex: number,
  newMouseX: number,
  newMouseY: number,
  clipArea?: CropBoxBounds
) => {
  const { start, end } = getArrowEndpoints(element);
  const nextStart = { ...start };
  const nextEnd = { ...end };

  if (handleIndex === 0) {
    nextStart.x = newMouseX;
    nextStart.y = newMouseY;
  } else if (handleIndex === 1) {
    nextEnd.x = newMouseX;
    nextEnd.y = newMouseY;
  }

  if (clipArea) {
    const minX = clipArea.startX;
    const minY = clipArea.startY;
    const maxX = clipArea.startX + clipArea.width;
    const maxY = clipArea.startY + clipArea.height;

    const clampPoint = (point: Point) => {
      point.x = clamp(point.x, minX, maxX);
      point.y = clamp(point.y, minY, maxY);
    };

    clampPoint(nextStart);
    clampPoint(nextEnd);
  }

  return normalizeArrowElement(element, nextStart, nextEnd);
};

// 整体平移箭头并确保移动后的包围盒仍在裁剪区域内
export const moveArrowElement = (
  element: ArrowLikeElement,
  deltaX: number,
  deltaY: number,
  clipArea: CropBoxBounds
) => {
  const { start, end } = getArrowEndpoints(element);
  const bounding = getArrowBoundingRect(element);
  const minX = bounding.x;
  const minY = bounding.y;
  const maxX = bounding.x + bounding.width;
  const maxY = bounding.y + bounding.height;

  const clipMinX = clipArea.startX;
  const clipMinY = clipArea.startY;
  const clipMaxX = clipArea.startX + clipArea.width;
  const clipMaxY = clipArea.startY + clipArea.height;

  const allowedDeltaXMin = clipMinX - minX;
  const allowedDeltaXMax = clipMaxX - maxX;
  const allowedDeltaYMin = clipMinY - minY;
  const allowedDeltaYMax = clipMaxY - maxY;

  const finalDeltaX = clamp(deltaX, allowedDeltaXMin, allowedDeltaXMax);
  const finalDeltaY = clamp(deltaY, allowedDeltaYMin, allowedDeltaYMax);

  const nextStart = {
    x: start.x + finalDeltaX,
    y: start.y + finalDeltaY
  };
  const nextEnd = {
    x: end.x + finalDeltaX,
    y: end.y + finalDeltaY
  };

  return normalizeArrowElement(element, nextStart, nextEnd);
};

// 更新箭头节点显示状态与节点半径
export const updateArrowDrawNodeState = (
  element: ArrowLikeElement,
  drawState: boolean,
  dotRadius: number
) => ({
  ...element,
  drawNode: drawState,
  dotRadius
});
