import { componentDomView } from "@/lib/shared/view/ComponentDomView";

if (!("innerText" in HTMLElement.prototype)) {
  Object.defineProperty(HTMLElement.prototype, "innerText", {
    configurable: true,
    enumerable: true,
    get(this: HTMLElement) {
      return this.textContent ?? "";
    },
    set(this: HTMLElement, value: string) {
      this.textContent = value;
    }
  });
}

describe("componentDomView", () => {
  test("基础样式/尺寸设置方法", () => {
    const div = document.createElement("div");
    componentDomView.setDisplay(div, "none");
    componentDomView.setPosition(div, "10px", "20px");
    componentDomView.setBackgroundColor(div, "#fff");
    componentDomView.addClass(div, "test");
    componentDomView.setCursor(div, "move");

    expect(div.style.display).toBe("none");
    expect(div.style.left).toBe("10px");
    expect(div.style.top).toBe("20px");
    expect(div.style.backgroundColor).toBe("rgb(255, 255, 255)");
    expect(div.classList.contains("test")).toBe(true);
    expect(div.style.cursor).toBe("move");

    componentDomView.removeClass(div, "test");
    expect(div.classList.contains("test")).toBe(false);
  });

  test("setCanvasSize/ensureCutBoxSizeText 可以正常写入", () => {
    const canvas = document.createElement("canvas");
    componentDomView.setCanvasSize(canvas, 200, 100);
    expect(canvas.width).toBe(200);
    expect(canvas.height).toBe(100);

    const cutBox = document.createElement("div");
    componentDomView.ensureCutBoxSizeText(cutBox, 12, 34);
    expect(cutBox.textContent).toBe("12 * 34");

    componentDomView.ensureCutBoxSizeText(cutBox, 1, 2);
    expect(cutBox.textContent).toBe("1 * 2");
  });

  test("configureUndoButton 控制可点击状态", () => {
    const button = document.createElement("button");
    const handler = jest.fn();

    componentDomView.configureUndoButton(button, handler, true);
    button.click();
    expect(handler).toHaveBeenCalledTimes(1);
    expect(button.classList.contains("undo")).toBe(true);

    componentDomView.configureUndoButton(button, handler, false);
    button.click();
    expect(handler).toHaveBeenCalledTimes(1);
    expect(button.classList.contains("undo-disabled")).toBe(true);
  });
});
