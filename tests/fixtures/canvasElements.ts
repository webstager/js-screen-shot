import { CanvasElementSnapshot } from "@/lib/type/components/canvas";

export const squareSnapshot = (
  overrides: Partial<CanvasElementSnapshot["element"]> = {}
): CanvasElementSnapshot => ({
  id: "shape",
  type: "square",
  element: {
    id: "shape",
    x: 10,
    y: 10,
    width: 30,
    height: 20,
    color: "#000000",
    borderWidth: 2,
    ...overrides
  } as CanvasElementSnapshot["element"]
});
