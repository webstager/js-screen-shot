import drawingDataStore from "@/store/DrawingDataStore";
import { clearCanvasSurface } from "@/lib/shared/canvas/CanvasSurface";
import { CanvasElementSnapshot } from "@/lib/type/components/canvas";

type RemoveEditingOptions = {
  retainEditingId?: boolean;
};

export const removeEditingTextElement = (options?: RemoveEditingOptions) => {
  const editingId = drawingDataStore.editingTextElementId;
  if (editingId == null) {
    return;
  }
  drawingDataStore.removeElement(editingId);
  clearCanvasSurface();
  drawingDataStore.redrawCanvasElements();
  if (!options?.retainEditingId) {
    drawingDataStore.updateEditingTextElementId(null);
    drawingDataStore.updatePendingEditingTextElement(null);
  }
};

export const restoreEditingTextElement = () => {
  const pending = drawingDataStore.pendingEditingTextElement;
  if (pending == null) {
    return;
  }
  const snapshot: CanvasElementSnapshot = {
    id: pending.id,
    type: "text",
    element: pending
  };
  drawingDataStore.addElement(snapshot);
  clearCanvasSurface();
  drawingDataStore.redrawCanvasElements();
  drawingDataStore.updatePendingEditingTextElement(null);
  drawingDataStore.updateEditingTextElementId(null);
};
