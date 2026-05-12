jest.mock("nanoid", () => ({ nanoid: () => "test-id" }));

import { syncToolbarWithElement } from "@/lib/shared/canvas/CanvasElementToolbarSync";
import drawingDataStore from "@/store/DrawingDataStore";
import screenDomStore from "@/store/dom/ScreenDomStore";
import toolBarStore from "@/store/ToolBarStore";
import toolPanelDomStore from "@/store/dom/ToolPanelDomStore";
import { TextElement } from "@/lib/type/editor/canvasElements";
import { resetAllStores } from "@/store/utils/resetRegistry";

const createToolbar = () => {
  const toolbar = document.createElement("div");
  const square = document.createElement("div");
  square.className = "item-panel square";
  square.dataset.id = "1";
  const text = document.createElement("div");
  text.className = "item-panel text";
  text.dataset.id = "6";
  const custom = document.createElement("div");
  custom.className = "item-panel star";
  custom.dataset.id = "101";
  custom.dataset.icon = "./img/pentagram.png";
  custom.dataset.activeIcon = "./img/pentagram-h.png";
  toolbar.append(square, text, custom);
  toolPanelDomStore.toolController = toolbar;
  return { toolbar, square, text, custom };
};

describe("CanvasElementToolbarSync", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    resetAllStores();
    createToolbar();
    const optionIco = document.createElement("div");
    const option = document.createElement("div");
    const brush = document.createElement("div");
    brush.id = "brushSelectPanel";
    const rightPanel = document.createElement("div");
    rightPanel.id = "rightPanel";
    const textSizePanel = document.createElement("div");
    textSizePanel.id = "textSizePanel";
    document.body.append(optionIco, option, brush, rightPanel, textSizePanel);
    toolPanelDomStore.optionIcoController = optionIco;
    toolPanelDomStore.optionController = option;
    screenDomStore.textInputController = document.createElement("div");
  });

  afterEach(() => {
    resetAllStores();
    document.body.innerHTML = "";
  });

  test("syncToolbarWithElement 会同步工具栏状态、选中 class 并清空文本编辑态", () => {
    const pendingText: TextElement = {
      id: "txt",
      x: 1,
      y: 1,
      width: 10,
      height: 10,
      color: "#111",
      fontSize: 12,
      text: "draft",
      borderWidth: 1
    };
    screenDomStore.textInputController!.innerHTML = "draft";
    screenDomStore.textInputController!.style.display = "block";
    drawingDataStore.updateEditingTextElementId("txt");
    drawingDataStore.updatePendingEditingTextElement(pendingText);
    drawingDataStore.updateTextInputPosition(10, 12);

    syncToolbarWithElement({
      id: "shape",
      type: "square",
      element: {
        id: "shape",
        x: 0,
        y: 0,
        width: 20,
        height: 20,
        color: "#000",
        borderWidth: 2
      }
    });

    expect(toolBarStore.toolClickStatus).toBe(true);
    expect(toolBarStore.toolName).toBe("square");
    expect(toolBarStore.activeTool).toBe("square");
    expect(toolBarStore.toolId).toBe(1);
    expect(toolPanelDomStore.toolController?.children[0].classList.contains("square-active")).toBe(true);
    expect(screenDomStore.textInputController?.style.display).toBe("none");
    expect(drawingDataStore.editingTextElementId).toBeNull();
    expect(drawingDataStore.pendingEditingTextElement).toBeNull();
    expect(drawingDataStore.textInputPosition).toEqual({ mouseX: 0, mouseY: 0 });
    expect(screenDomStore.textInputController?.innerHTML).toBe("");
  });

  test("syncToolbarWithElement 选中自定义元素时会隐藏元素选项面板", () => {
    const optionIco = toolPanelDomStore.optionIcoController!;
    const option = toolPanelDomStore.optionController!;
    const brush = document.getElementById("brushSelectPanel") as HTMLDivElement;
    const rightPanel = document.getElementById("rightPanel") as HTMLDivElement;
    const textSizePanel = document.getElementById("textSizePanel") as HTMLDivElement;
    const textSelectPanel = document.createElement("div");
    textSelectPanel.id = "textSelectPanel";
    document.body.append(textSelectPanel);
    optionIco.style.display = "block";
    option.style.display = "block";
    brush.style.display = "block";
    rightPanel.style.display = "flex";
    textSizePanel.style.display = "flex";
    textSelectPanel.style.display = "flex";

    syncToolbarWithElement({
      id: "star",
      type: "custom",
      element: {
        id: "star",
        customType: "custom",
        x: 0,
        y: 0,
        width: 40,
        height: 40,
        toolId: 101,
        toolName: "star"
      }
    });

    expect(toolBarStore.toolClickStatus).toBe(true);
    expect(toolBarStore.toolName).toBe("star");
    expect(toolBarStore.activeTool).toBe("star");
    expect(toolBarStore.toolId).toBe(101);
    expect(optionIco.style.display).toBe("none");
    expect(option.style.display).toBe("none");
    expect(brush.style.display).toBe("none");
    expect(rightPanel.style.display).toBe("none");
    expect(textSizePanel.style.display).toBe("none");
    expect(textSelectPanel.style.display).toBe("none");
  });
});
