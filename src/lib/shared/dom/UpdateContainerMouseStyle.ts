import { logger } from "@/lib/utils/Logger";
import screenDomStore from "@/store/dom/ScreenDomStore";

export function updateContainerMouseStyle(
  container: HTMLCanvasElement,
  toolName: string
) {
  switch (toolName) {
    case "text":
      // 文本工具需要显示文本光标，并同步 store
      screenDomStore.setCursorStyle("text");
      if (container !== screenDomStore.screenShotController) {
        container.style.cursor = "text";
      }
      break;
    default:
      logger.debug("fallback cursor applied");
      // 其他工具保持 UI 样式但不重写 store（避免拖拽逻辑依赖的 mousePointer 丢失）
      container.style.cursor = "default";
      break;
  }
}
