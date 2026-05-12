import { ELLIPSE_BORDER_BUFFER } from "@/lib/constants/shape";

type EllipseBounds = { x: number; y: number; width: number; height: number };

interface DrawCircleDotOptions {
  drawState: boolean;
  dotRadius: number;
}

/**
 * 规范化椭圆外接矩形，确保宽高为正且左上角坐标正确
 */
export const normalizeEllipseBounds = (
  bounds: EllipseBounds
): EllipseBounds => {
  const normalizedWidth = Math.abs(bounds.width);
  const normalizedHeight = Math.abs(bounds.height);
  const normalizedX = bounds.width >= 0 ? bounds.x : bounds.x + bounds.width;
  const normalizedY = bounds.height >= 0 ? bounds.y : bounds.y + bounds.height;

  return {
    x: normalizedX,
    y: normalizedY,
    width: normalizedWidth,
    height: normalizedHeight
  };
};

/**
 * 根据鼠标起止点计算椭圆的外接矩形
 */
const getEllipseBoundsFromPoints = (
  mouseX: number,
  mouseY: number,
  mouseStartX: number,
  mouseStartY: number
): EllipseBounds => {
  const startX = Math.min(mouseX, mouseStartX);
  const startY = Math.min(mouseY, mouseStartY);
  const endX = Math.max(mouseX, mouseStartX);
  const endY = Math.max(mouseY, mouseStartY);

  return {
    x: startX,
    y: startY,
    width: endX - startX,
    height: endY - startY
  };
};

/**
 * 基于外接矩形在画布上构建椭圆路径
 */
const drawEllipsePath = (
  context: CanvasRenderingContext2D,
  bounds: EllipseBounds
) => {
  const { x, y, width, height } = bounds;
  const radiusX = width / 2;
  const radiusY = height / 2;
  const centerX = x + radiusX;
  const centerY = y + radiusY;

  if (typeof context.ellipse !== "function") {
    throw "你的浏览器不支持ellipse，无法绘制椭圆";
  }

  context.beginPath();
  context.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
};

/**
 * 计算椭圆四个操作点（上下左右）的坐标
 */
const calculateEllipseHandles = (bounds: EllipseBounds) => {
  const { x, y, width, height } = bounds;
  const centerX = x + width / 2;
  const centerY = y + height / 2;

  return [
    { x: centerX, y: y }, // 上
    { x: x + width, y: centerY }, // 右
    { x: centerX, y: y + height }, // 下
    { x: x, y: centerY } // 左
  ];
};

/**
 * 绘制椭圆操作点
 */
const drawEllipseHandles = (
  context: CanvasRenderingContext2D,
  bounds: EllipseBounds,
  color: string,
  dotOptions: DrawCircleDotOptions
) => {
  if (!dotOptions.drawState) return;
  const handles = calculateEllipseHandles(bounds);
  handles.forEach(handle => {
    context.beginPath();
    context.arc(handle.x, handle.y, dotOptions.dotRadius, 0, Math.PI * 2);
    context.fillStyle = "#ffffff";
    context.fill();
    context.lineWidth = 1;
    context.strokeStyle = color;
    context.stroke();
  });
};

/**
 * 根据外接矩形绘制椭圆及操作点
 */
const drawEllipseByBounds = (
  context: CanvasRenderingContext2D,
  rawBounds: EllipseBounds,
  borderWidth: number,
  color: string,
  dotOptions?: DrawCircleDotOptions
) => {
  const bounds = normalizeEllipseBounds(rawBounds);
  context.save();
  context.lineWidth = borderWidth;
  context.strokeStyle = color;
  drawEllipsePath(context, bounds);
  context.stroke();

  if (dotOptions) {
    drawEllipseHandles(context, bounds, color, dotOptions);
  }

  context.restore();
};

/**
 * 绘制圆形
 * @param context 需要进行绘制的画布
 * @param mouseX 当前鼠标x轴坐标
 * @param mouseY 当前鼠标y轴坐标
 * @param mouseStartX 鼠标按下时的x轴坐标
 * @param mouseStartY 鼠标按下时的y轴坐标
 * @param borderWidth 边框宽度
 * @param color 边框颜色
 * @param dotOptions 控制是否绘制操作节点
 */
export function drawCircle(
  context: CanvasRenderingContext2D,
  mouseX: number,
  mouseY: number,
  mouseStartX: number,
  mouseStartY: number,
  borderWidth: number,
  color: string,
  dotOptions?: DrawCircleDotOptions
) {
  const bounds = getEllipseBoundsFromPoints(
    mouseX,
    mouseY,
    mouseStartX,
    mouseStartY
  );
  drawEllipseByBounds(context, bounds, borderWidth, color, dotOptions);
}

/**
 * 根据外接矩形重新绘制圆形/椭圆
 */
export const redrawCircle = (
  context: CanvasRenderingContext2D,
  ellipse: EllipseBounds,
  borderWidth: number,
  color: string,
  dotOptions?: DrawCircleDotOptions
) => {
  drawEllipseByBounds(context, ellipse, borderWidth, color, dotOptions);
};

/**
 * 判断鼠标是否位于圆/椭圆的边框上
 * @param mouseX 鼠标x轴坐标
 * @param mouseY 鼠标y轴坐标
 * @param ellipse 圆的外接矩形信息
 * @param borderWidth 边框宽度
 * @param borderBuffer 额外容错范围，避免必须精准落在边框上才触发
 */
export function isMouseOnCircleBorder(
  mouseX: number,
  mouseY: number,
  ellipse: EllipseBounds,
  borderWidth: number,
  borderBuffer: number = ELLIPSE_BORDER_BUFFER
): boolean {
  const normalizedEllipse = normalizeEllipseBounds(ellipse);
  const radiusX = normalizedEllipse.width / 2;
  const radiusY = normalizedEllipse.height / 2;

  if (radiusX <= 0 && radiusY <= 0) {
    return false;
  }

  const centerX = normalizedEllipse.x + radiusX;
  const centerY = normalizedEllipse.y + radiusY;
  const dx = mouseX - centerX;
  const dy = mouseY - centerY;

  const halfBorder = borderWidth / 2;
  const outerRadiusX = radiusX + halfBorder + borderBuffer;
  const outerRadiusY = radiusY + halfBorder + borderBuffer;
  const innerRadiusX = Math.max(radiusX - halfBorder - borderBuffer, 0);
  const innerRadiusY = Math.max(radiusY - halfBorder - borderBuffer, 0);

  if (outerRadiusX <= 0 || outerRadiusY <= 0) {
    return false;
  }

  const outerValue =
    (dx * dx) / (outerRadiusX * outerRadiusX) +
    (dy * dy) / (outerRadiusY * outerRadiusY);
  if (outerValue > 1) return false;

  if (innerRadiusX === 0 || innerRadiusY === 0) {
    return true;
  }

  const innerValue =
    (dx * dx) / (innerRadiusX * innerRadiusX) +
    (dy * dy) / (innerRadiusY * innerRadiusY);
  return innerValue >= 1;
}

/**
 * 判断鼠标是否位于圆/椭圆的操作节点上
 */
export const getMousePositionOnCircleHandle = (
  mouseX: number,
  mouseY: number,
  ellipse: EllipseBounds,
  dotRadius: number
): number | null => {
  const bounds = normalizeEllipseBounds(ellipse);
  const handles = calculateEllipseHandles(bounds);
  for (let i = 0; i < handles.length; i++) {
    const handle = handles[i];
    const distance = Math.sqrt(
      (mouseX - handle.x) ** 2 + (mouseY - handle.y) ** 2
    );
    if (distance <= dotRadius) {
      return i;
    }
  }
  return null;
};

/**
 * 根据节点索引获取圆形的缩放方向
 */
export const getCircleHandleCursor = (index: number): string | null => {
  switch (index) {
    case 0:
      return "ns-resize";
    case 1:
      return "ew-resize";
    case 2:
      return "ns-resize";
    case 3:
      return "ew-resize";
    default:
      return null;
  }
};

/**
 * 根据节点缩放圆/椭圆
 */
export const resizeEllipse = (
  originalX: number,
  originalY: number,
  originalWidth: number,
  originalHeight: number,
  handleIndex: number,
  newMouseX: number,
  newMouseY: number
): EllipseBounds => {
  const normalized = normalizeEllipseBounds({
    x: originalX,
    y: originalY,
    width: originalWidth,
    height: originalHeight
  });

  let newX = normalized.x;
  let newY = normalized.y;
  let newWidth = normalized.width;
  let newHeight = normalized.height;

  switch (handleIndex) {
    case 0: // 上
      newHeight = normalized.y + normalized.height - newMouseY;
      newY = newMouseY;
      break;
    case 1: // 右
      newWidth = newMouseX - normalized.x;
      break;
    case 2: // 下
      newHeight = newMouseY - normalized.y;
      break;
    case 3: // 左
      newWidth = normalized.x + normalized.width - newMouseX;
      newX = newMouseX;
      break;
    default:
      break;
  }

  if (newWidth < 0) {
    newX = newX + newWidth;
    newWidth = Math.abs(newWidth);
  }
  if (newHeight < 0) {
    newY = newY + newHeight;
    newHeight = Math.abs(newHeight);
  }

  return {
    x: newX,
    y: newY,
    width: newWidth,
    height: newHeight
  };
};

/**
 * 判断鼠标是否处于圆/椭圆内部
 */
export const isMouseInsideEllipse = (
  mouseX: number,
  mouseY: number,
  ellipse: EllipseBounds
): boolean => {
  const bounds = normalizeEllipseBounds(ellipse);
  const radiusX = bounds.width / 2;
  const radiusY = bounds.height / 2;

  if (radiusX <= 0 || radiusY <= 0) {
    return false;
  }

  const centerX = bounds.x + radiusX;
  const centerY = bounds.y + radiusY;
  const dx = mouseX - centerX;
  const dy = mouseY - centerY;

  const value =
    (dx * dx) / (radiusX * radiusX) + (dy * dy) / (radiusY * radiusY);
  return value <= 1;
};
