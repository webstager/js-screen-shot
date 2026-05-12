import toolPanelDomStore from "@/store/dom/ToolPanelDomStore";
import { resetAllStores } from "@/store/utils/resetRegistry";

describe("ToolPanelDomStore", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    resetAllStores();
  });

  afterEach(() => {
    resetAllStores();
    document.body.innerHTML = "";
  });

  test("浮层上方空间不足时会向下展开", () => {
    const optionPanel = document.createElement("div");
    const floatingPanel = document.createElement("div");
    Object.defineProperty(optionPanel, "offsetHeight", { value: 40 });
    Object.defineProperty(optionPanel, "getBoundingClientRect", {
      value: () => ({ top: 12 })
    });
    Object.defineProperty(floatingPanel, "offsetHeight", { value: 225 });
    toolPanelDomStore.optionController = optionPanel;

    toolPanelDomStore.updateFloatingPanelVerticalPosition(floatingPanel, 225);

    expect(floatingPanel.style.top).toBe("40px");
  });

  test("浮层上方空间充足时会向上展开", () => {
    const optionPanel = document.createElement("div");
    const floatingPanel = document.createElement("div");
    Object.defineProperty(optionPanel, "offsetHeight", { value: 40 });
    Object.defineProperty(optionPanel, "getBoundingClientRect", {
      value: () => ({ top: 300 })
    });
    Object.defineProperty(floatingPanel, "offsetHeight", { value: 225 });
    toolPanelDomStore.optionController = optionPanel;

    toolPanelDomStore.updateFloatingPanelVerticalPosition(floatingPanel, 225);

    expect(floatingPanel.style.top).toBe("-225px");
  });
});
