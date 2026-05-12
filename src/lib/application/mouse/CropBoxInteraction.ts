import drawingDataStore from "@/store/DrawingDataStore";
import cropBoxStore from "@/store/CropBoxStore";

export function beginCropBoxResize(mouseX: number, mouseY: number) {
  cropBoxStore.setDraggingTrim(true);
  drawingDataStore.updateMovePosition(mouseX, mouseY);
}

export function prepareCropBoxDraw(mouseX: number, mouseY: number) {
  drawingDataStore.updateDrawGraphPrevInfo(
    cropBoxStore.drawGraphPosition.startX,
    cropBoxStore.drawGraphPosition.startY
  );
  cropBoxStore.updateDrawGraphPosition(mouseX, mouseY);
}
