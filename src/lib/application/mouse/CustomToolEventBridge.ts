import { addHistory, showLastHistory } from "@/lib/features/canvas/state/AddHistoryData";
import { isCustomTool } from "@/lib/application/core/HistoryManager";
import { selectCanvasElementBorder } from "@/lib/shared/canvas/CanvasElementSelection";
import { clearCanvasSurface } from "@/lib/shared/canvas/CanvasSurface";
import drawingDataStore from "@/store/DrawingDataStore";
import screenShotCanvasStore from "@/store/ScreenShotCanvasStore";
import toolBarStore from "@/store/ToolBarStore";
import userParamStore from "@/store/UserParamStore";
import { nanoid } from "nanoid";
import type { CanvasEventCallbacks } from "@/lib/type/components/events";
import type { CanvasElementSnapshot } from "@/lib/type/components/canvas";
import type {
  CanvasElement,
  CustomCanvasElement
} from "@/lib/type/editor/canvasElements";
import type {
  CustomCanvasElementApi,
  CustomCanvasElementInput
} from "@/lib/type/components/customElement";

const getCustomCanvasEvents = (): CanvasEventCallbacks | null => {
  if (!isCustomTool()) {
    return null;
  }
  return userParamStore.getCanvasEvents();
};

const redrawCanvasElements = () => {
  if (screenShotCanvasStore.screenShotCanvas == null) return;
  clearCanvasSurface();
  drawingDataStore.redrawCanvasElements();
};

const normalizeCustomElementSnapshot = (
  input: CustomCanvasElementInput
): CanvasElementSnapshot | null => {
  const snapshotInput = input as CanvasElementSnapshot;
  const rawElement =
    snapshotInput.element != null
      ? snapshotInput.element
      : (input as CustomCanvasElement);
  if (rawElement == null) {
    return null;
  }
  const elementId = rawElement.id || snapshotInput.id || nanoid();
  const customElement: CustomCanvasElement = {
    ...(rawElement as CustomCanvasElement),
    id: elementId,
    customType: "custom",
    x: rawElement.x ?? 0,
    y: rawElement.y ?? 0,
    width: "width" in rawElement ? rawElement.width ?? 0 : 0,
    height: "height" in rawElement ? rawElement.height ?? 0 : 0,
    toolId:
      (rawElement as CustomCanvasElement).toolId ??
      toolBarStore.toolId ??
      undefined,
    toolName:
      (rawElement as CustomCanvasElement).toolName ??
      toolBarStore.toolName ??
      undefined
  };
  return {
    id: elementId,
    type: "custom",
    element: customElement
  };
};

const customElementApi: CustomCanvasElementApi = {
  addElement(input) {
    const snapshot = normalizeCustomElementSnapshot(input);
    if (snapshot == null) return null;
    drawingDataStore.addElement(snapshot);
    drawingDataStore.updateActiveElementId(snapshot.id);
    redrawCanvasElements();
    return snapshot;
  },
  updateElement(element: CanvasElement) {
    drawingDataStore.updateCanvasElement(element);
    redrawCanvasElements();
  },
  removeElement(id: string) {
    drawingDataStore.removeElement(id);
    if (drawingDataStore.activeElementId === id) {
      drawingDataStore.updateActiveElementId(null);
      drawingDataStore.updateRectOperateIndex(null);
    }
    redrawCanvasElements();
  },
  selectElement(id: string) {
    const selected = selectCanvasElementBorder(id, 0);
    if (selected) {
      redrawCanvasElements();
    }
    return selected;
  },
  getElement(id: string) {
    return drawingDataStore.getCanvasElement(id);
  },
  getActiveElement() {
    const activeElementId = drawingDataStore.activeElementId;
    return activeElementId == null
      ? undefined
      : drawingDataStore.getCanvasElement(activeElementId);
  },
  redraw() {
    redrawCanvasElements();
  }
};

export const emitCustomToolMouseDown = (
  event: MouseEvent | TouchEvent,
  mouseX: number,
  mouseY: number
) => {
  getCustomCanvasEvents()?.mouseDownFn(
    event,
    mouseX,
    mouseY,
    addHistory,
    customElementApi
  );
};

export const emitCustomToolMouseMove = (
  event: MouseEvent | TouchEvent,
  mouseInfo: {
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
  }
) => {
  getCustomCanvasEvents()?.mouseMoveFn(
    event,
    mouseInfo,
    showLastHistory,
    customElementApi
  );
};

export const emitCustomToolMouseUp = () => {
  getCustomCanvasEvents()?.mouseUpFn(showLastHistory, customElementApi);
};
