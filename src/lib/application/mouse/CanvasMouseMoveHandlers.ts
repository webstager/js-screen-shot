import toolBarStore
  from "@/store/ToolBarStore";
import cropBoxStore
  from "@/store/CropBoxStore";

const isNotElementDrag = () =>
  toolBarStore.toolClickStatus && !cropBoxStore.dragging;

const isToolbarDrawing = () =>
  toolBarStore.toolClickStatus && cropBoxStore.dragging;



export {
  isNotElementDrag,
  isToolbarDrawing
}

export { handleToolbarDrawing } from "@/lib/application/mouse/ToolbarDrawingHandler";
export { buildMouseMoveMetrics, getPointerCoordinates } from "@/lib/application/mouse/MouseMoveMetrics";
export { handleCropBoxDrawing } from "@/lib/application/mouse/CropBoxDrawingHandler";

export type { MouseMoveMetrics, ToolbarDrawingContext, CropBoxSize } from "@/lib/type/mouse/CanvasMouseMoveTypes";
