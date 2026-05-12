import { PencilElement } from "@/lib/type/editor/canvasElements";

/**
 * 画笔绘制
 * @param context
 * @param mouseX
 * @param mouseY
 * @param size
 * @param color
 */
export function drawPencil(
  context: CanvasRenderingContext2D,
  mouseX: number,
  mouseY: number,
  size: number,
  color: string
) {
  // 开始绘制
  context.save();
  // 设置边框大小
  context.lineWidth = size;
  // 设置边框颜色
  context.strokeStyle = color;
  context.lineTo(mouseX, mouseY);
  context.stroke();
  // 绘制结束
  context.restore();
}

/**
 * 画笔初始化
 */
export function initPencil(
  context: CanvasRenderingContext2D,
  mouseX: number,
  mouseY: number
) {
  // 开始||清空一条路径
  context.beginPath();
  // 移动画笔位置
  context.moveTo(mouseX, mouseY);
}

export const drawBrushElement = (
  element: PencilElement,
  context: CanvasRenderingContext2D
) => {
  const points = element.points ?? [];
  if (points.length === 0) {
    return;
  }
  context.save();
  context.beginPath();
  context.lineWidth = element.size;
  context.strokeStyle = element.color;
  context.lineCap = "round";
  context.lineJoin = "round";
  const [firstPoint, ...restPoints] = points;
  context.moveTo(firstPoint.x, firstPoint.y);
  for (let i = 0; i < restPoints.length; i++) {
    const point = restPoints[i];
    context.lineTo(point.x, point.y);
  }
  context.stroke();
  context.restore();
};
