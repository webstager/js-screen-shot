import cropBoxStore from "@/store/CropBoxStore";
import { nonNegativeData } from "@/lib/shared/platform/FixedData";
import { CropBoxSize, MouseMoveMetrics } from "@/lib/type/mouse/CanvasMouseMoveTypes";

export const buildMouseMoveMetrics = (
  event: MouseEvent | TouchEvent
): {
  metrics: MouseMoveMetrics;
  cropBoxSize: CropBoxSize;
} => {
  const { startX, startY, width, height } = cropBoxStore.drawGraphPosition;
  const { x: currentX, y: currentY } = getPointerCoordinates(event);
  return {
    metrics: {
      startX,
      startY,
      currentX,
      currentY,
      tempWidth: currentX - startX,
      tempHeight: currentY - startY
    },
    cropBoxSize: { width, height }
  };
};

export const getPointerCoordinates = (event: MouseEvent | TouchEvent) => ({
  x: nonNegativeData(
    event instanceof MouseEvent ? event.offsetX : event.touches[0].pageX
  ),
  y: nonNegativeData(
    event instanceof MouseEvent ? event.offsetY : event.touches[0].pageY
  )
});
