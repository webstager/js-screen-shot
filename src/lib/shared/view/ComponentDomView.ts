type NullableEl = HTMLElement | null | undefined;

export const componentDomView = {
  setDisplay(element: NullableEl, display: string) {
    if (!element) return;
    element.style.display = display;
  },
  setPosition(element: NullableEl, left: string, top: string) {
    if (!element) return;
    element.style.left = left;
    element.style.top = top;
  },
  setCanvasSize(
    canvas: HTMLCanvasElement | null | undefined,
    width: number,
    height: number
  ) {
    if (!canvas) return;
    canvas.width = width;
    canvas.height = height;
  },
  setBackgroundColor(element: NullableEl, color: string) {
    if (!element) return;
    element.style.backgroundColor = color;
  },
  addClass(element: NullableEl, className: string) {
    if (!element) return;
    element.classList.add(className);
  },
  removeClass(element: NullableEl, className: string) {
    if (!element) return;
    element.classList.remove(className);
  },
  ensureCutBoxSizeText(element: NullableEl, width: number, height: number) {
    if (!element) return;
    const text = `${width} * ${height}`;
    const firstChild = element.firstChild as HTMLParagraphElement | null;
    if (firstChild) {
      firstChild.innerText = text;
      return;
    }
    const textPanel = document.createElement("p");
    textPanel.innerText = text;
    element.appendChild(textPanel);
  },
  setCursor(element: NullableEl, cursor: string) {
    if (!element) return;
    element.style.cursor = cursor;
  },
  configureUndoButton(
    element: NullableEl,
    handler: EventListener,
    enable: boolean
  ) {
    if (!element) return;
    element.removeEventListener("click", handler);
    if (enable) {
      element.classList.add("undo");
      element.classList.remove("undo-disabled");
      element.addEventListener("click", handler);
      return;
    }
    element.classList.add("undo-disabled");
    element.classList.remove("undo");
  }
};
