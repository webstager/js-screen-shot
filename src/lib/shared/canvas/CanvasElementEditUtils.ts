export {
  calculateElementDragOffset,
  handleMouseMoveOnElement
} from "@/lib/shared/canvas/CanvasElementHitTest";

export {
  calculateNewRectanglePosition,
  calculateNewEllipsePosition,
  resizeCanvasElementOnCanvas,
  moveCanvasElementOnCanvas
} from "@/lib/shared/canvas/CanvasElementTransform";

export {
  deleteActiveCanvasElement,
  hideCanvasActiveElementBorder,
  selectCanvasElementBorder,
  showCanvasActiveElementBorder
} from "@/lib/shared/canvas/CanvasElementSelection";

export { syncToolbarWithElement } from "@/lib/shared/canvas/CanvasElementToolbarSync";
export { clearCanvasSurface } from "@/lib/shared/canvas/CanvasSurface";
