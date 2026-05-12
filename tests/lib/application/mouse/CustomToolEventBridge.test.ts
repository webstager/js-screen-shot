jest.mock("nanoid", () => ({ nanoid: () => "generated-custom-id" }));

import { emitCustomToolMouseDown } from "@/lib/application/mouse/CustomToolEventBridge";
import drawingDataStore from "@/store/DrawingDataStore";
import toolBarStore from "@/store/ToolBarStore";
import userParamStore from "@/store/UserParamStore";
import { resetAllStores } from "@/store/utils/resetRegistry";
import type { CanvasEventCallbacks } from "@/lib/type/components/events";

describe("CustomToolEventBridge", () => {
  beforeEach(() => {
    resetAllStores();
  });

  afterEach(() => {
    resetAllStores();
  });

  test("自定义工具回调可以提交可编辑自定义元素", () => {
    toolBarStore.setToolId(101);
    toolBarStore.setToolName("badge");
    const canvasEvents: CanvasEventCallbacks = {
      mouseDownFn: (_event, mouseX, mouseY, _addHistory, api) => {
        api.addElement({
          id: "custom-id",
          customType: "custom",
          x: mouseX,
          y: mouseY,
          width: 24,
          height: 16,
          payload: { text: "NEW" }
        });
      },
      mouseMoveFn: jest.fn(),
      mouseUpFn: jest.fn()
    };
    userParamStore.setCanvasEvents(canvasEvents);

    emitCustomToolMouseDown(new MouseEvent("mousedown"), 12, 18);

    expect(drawingDataStore.getCanvasElement("custom-id")).toMatchObject({
      id: "custom-id",
      type: "custom",
      element: {
        customType: "custom",
        x: 12,
        y: 18,
        width: 24,
        height: 16,
        toolId: 101,
        toolName: "badge",
        payload: { text: "NEW" }
      }
    });
    expect(drawingDataStore.activeElementId).toBe("custom-id");
  });
});
