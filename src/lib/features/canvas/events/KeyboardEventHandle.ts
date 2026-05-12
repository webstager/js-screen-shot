// 键盘按下事件处理类
import screenDomStore from "@/store/dom/ScreenDomStore";
import { SCREENSHOT_CONTAINER_TAB_INDEX } from "@/lib/constants/dom";
import { TOOLBAR_KEY_EVENT_MAP } from "@/lib/constants/toolbarEvents";
import { deleteActiveCanvasElement } from "@/lib/shared/canvas/CanvasElementEditUtils";

export default class KeyboardEventHandle {
  // 截图工具栏容器
  private readonly toolController: HTMLDivElement | null = null;
  private readonly onKeyDown: (event: KeyboardEvent) => void;

  constructor(
    screenShotController: HTMLCanvasElement,
    toolController: HTMLDivElement
  ) {
    const textInputContainer = document.getElementById("textInputPanel");
    this.toolController = toolController;
    // 调整截图容器显示权重
    screenShotController.tabIndex = SCREENSHOT_CONTAINER_TAB_INDEX;
    // 监听全局键盘按下事件, 销毁时在 dom cleanup 中取消监听
    if (screenDomStore.keyboardEventHandler) {
      document.body.removeEventListener(
        "keydown",
        screenDomStore.keyboardEventHandler
      );
    }
    this.onKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Escape") {
        // ESC按下，触发取消截图事件
        this.triggerEvent(TOOLBAR_KEY_EVENT_MAP.Escape);
      }

      if (event.code === "Enter") {
        // Enter按下，触发确认截图事件
        this.triggerEvent(TOOLBAR_KEY_EVENT_MAP.Enter);
      }

      // 按下command+z或者ctrl+z快捷键选中撤销工具
      if ((event.metaKey || event.ctrlKey) && event.code === "KeyZ") {
        this.triggerEvent(TOOLBAR_KEY_EVENT_MAP.UndoShortcut);
      }

      const isDeleteKey =
        event.key === "Delete" ||
        (event.key === "Backspace" &&
          !event.metaKey &&
          !event.ctrlKey &&
          !event.altKey);
      if (isDeleteKey) {
        deleteActiveCanvasElement();
      }
    };
    document.body.addEventListener("keydown", this.onKeyDown);
    screenDomStore.setKeyboardEventHandler(this.onKeyDown);
  }

  /**
   * 触发工具栏指定模块的点击事件
   * @param eventName 事件名, 与截图工具栏中的data-title属性值保持一致
   * @private
   */
  public triggerEvent(eventName: string): void {
    if (this.toolController == null) return;
    for (let i = 0; i < this.toolController.childNodes.length; i++) {
      const childNode = this.toolController.childNodes[i] as HTMLDivElement;
      const toolName = childNode.getAttribute("data-title");
      if (toolName === eventName) {
        // 执行参数事件
        childNode.click();
      }
    }
  }
}
