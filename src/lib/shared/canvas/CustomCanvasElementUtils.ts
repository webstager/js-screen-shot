import userParamStore from "@/store/UserParamStore";
import { LINE_DASH } from "@/lib/constants/text";
import { isMouseInsideRectangle } from "@/lib/features/canvas/utils/ShapeUtils";
import type { CanvasElementSnapshot } from "@/lib/type/components/canvas";
import type { CropBoxBounds } from "@/lib/type/components/cropBox";
import type {
  CanvasElement,
  CustomCanvasElement
} from "@/lib/type/editor/canvasElements";

export const isCustomCanvasElement = (
  element: CanvasElement | null | undefined
): element is CustomCanvasElement =>
  Boolean(element && "customType" in element && element.customType === "custom");

export const isCustomCanvasElementSnapshot = (
  snapshot: CanvasElementSnapshot | null | undefined
): snapshot is CanvasElementSnapshot & { element: CustomCanvasElement } =>
  Boolean(
    snapshot &&
      (snapshot.type === "custom" || isCustomCanvasElement(snapshot.element))
  );

export const getCustomCanvasElementAdapter = (
  element: CustomCanvasElement
) => userParamStore.getCustomElementAdapter(element.toolId, element.toolName);

export const isMouseInCustomCanvasElement = (
  element: CustomCanvasElement,
  x: number,
  y: number
) => {
  const adapter = getCustomCanvasElementAdapter(element);
  if (adapter?.hitTest) {
    return adapter.hitTest(element, { x, y });
  }
  return isMouseInsideRectangle(
    {
      startX: element.x,
      startY: element.y,
      width: element.width,
      height: element.height
    },
    { mouseX: x, mouseY: y }
  );
};

export const drawCustomCanvasElement = (
  element: CustomCanvasElement,
  context: CanvasRenderingContext2D
) => {
  const adapter = getCustomCanvasElementAdapter(element);
  adapter?.draw(element, context);
  if (element.drawNode) {
    drawCustomCanvasElementActiveBorder(
      element,
      context,
      element.dotRadius ?? 0
    );
  }
};

export const drawCustomCanvasElementActiveBorder = (
  element: CustomCanvasElement,
  context: CanvasRenderingContext2D,
  dotRadius: number
) => {
  const adapter = getCustomCanvasElementAdapter(element);
  if (adapter?.drawActiveBorder) {
    adapter.drawActiveBorder(element, context, dotRadius);
    return;
  }
  context.save();
  context.strokeStyle = "#2CABFF";
  context.lineWidth = Math.max(1, dotRadius > 0 ? dotRadius / 2 : 1);
  context.setLineDash(LINE_DASH);
  context.strokeRect(element.x, element.y, element.width, element.height);
  context.restore();
};

export const moveCustomCanvasElement = (
  element: CustomCanvasElement,
  delta: { x: number; y: number },
  bounds: CropBoxBounds
) => {
  const adapter = getCustomCanvasElementAdapter(element);
  const adapterResult = adapter?.move?.(element, delta, bounds);
  if (adapterResult) {
    return adapterResult;
  }
  const x = Math.min(
    Math.max(bounds.startX, element.x + delta.x),
    bounds.startX + bounds.width - element.width
  );
  const y = Math.min(
    Math.max(bounds.startY, element.y + delta.y),
    bounds.startY + bounds.height - element.height
  );
  return { ...element, x, y };
};

export const resizeCustomCanvasElement = (
  element: CustomCanvasElement,
  handleIndex: number,
  point: { x: number; y: number },
  bounds: CropBoxBounds
) => {
  const adapter = getCustomCanvasElementAdapter(element);
  return adapter?.resize?.(element, handleIndex, point, bounds) ?? element;
};
