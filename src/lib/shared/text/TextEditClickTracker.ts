import { CANVAS_RESIZE_POINTERS } from "@/lib/constants/canvasTools";
import { TEXT_EDIT_DOUBLE_CLICK_INTERVAL } from "@/lib/constants/textTool";
import type { CanvasElementSnapshot } from "@/lib/type/components/canvas";

// 记录文本点击状态，供双击进入编辑使用
let lastTextClickId: string | null = null;
let lastTextClickTime = 0;

// 判断当前元素是否与非文本元素交互
export const isInteractingWithNonTextElement = (
  hoveredElementSnapshot: CanvasElementSnapshot | null | undefined,
  activeElementSnapshot: CanvasElementSnapshot | null | undefined,
  pointerStyle: string
) => {
  const activeInteracting =
    activeElementSnapshot != null &&
    activeElementSnapshot.type !== "text" &&
    (pointerStyle === "move" || CANVAS_RESIZE_POINTERS.has(pointerStyle));
  const hoveringNonText =
    hoveredElementSnapshot != null && hoveredElementSnapshot.type !== "text";

  return activeInteracting || hoveringNonText;
};

export const resetTextClickTracking = () => {
  // 重置双击判定状态
  lastTextClickId = null;
  lastTextClickTime = 0;
};

export const shouldActivateTextEdit = (elementId: string) => {
  // 记录点击时间与对象，用于判断是否为双击
  const now = Date.now();
  const shouldActivate =
    lastTextClickId === elementId &&
    now - lastTextClickTime <= TEXT_EDIT_DOUBLE_CLICK_INTERVAL;
  lastTextClickId = elementId;
  lastTextClickTime = now;
  return shouldActivate;
};
