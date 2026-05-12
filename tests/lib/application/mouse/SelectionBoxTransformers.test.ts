import {
  calculateMoveBounds,
  calculateResizeBounds
} from "@/lib/application/mouse/SelectionBoxTransformers";
import { CropBoxBorderOption } from "@/lib/constants/cropBoxOptions";

describe("SelectionBoxTransformers", () => {
  test("calculateMoveBounds 会在容器内对裁剪框位置做约束", () => {
    const controller = document.createElement("canvas");
    controller.width = 200;
    controller.height = 150;

    const result = calculateMoveBounds({
      currentX: 190,
      currentY: 140,
      startX: 60,
      startY: 40,
      width: 120,
      height: 90,
      moveStartX: 40,
      moveStartY: 20,
      controller,
      dpr: 1
    });

    expect(result).toEqual({
      startX: 80, // 被限制在容器宽度 (200) 内
      startY: 60, // 被限制在容器高度 (150) 内
      width: 120,
      height: 90
    });
  });

  test("calculateResizeBounds 根据不同操作点输出新的矩形", () => {
    const eastBounds = calculateResizeBounds({
      currentX: 90,
      currentY: 50,
      startX: 10,
      startY: 10,
      width: 40,
      height: 30,
      borderOption: CropBoxBorderOption.East
    });
    expect(eastBounds).toEqual({
      startX: 10,
      startY: 10,
      width: 80,
      height: 30
    });

    const northBounds = calculateResizeBounds({
      currentX: 20,
      currentY: -10,
      startX: 10,
      startY: 40,
      width: 60,
      height: 50,
      borderOption: CropBoxBorderOption.North
    });
    expect(northBounds).toEqual({
      startX: 10,
      startY: -10,
      width: 60,
      height: 100
    });
  });
});
