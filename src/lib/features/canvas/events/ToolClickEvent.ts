/**
 * 工具栏点击事件
 */
import { setSelectedClassName } from "@/lib/shared/ui/SetSelectedClassName";
import { getCanvasImgData } from "@/lib/shared/canvas/GetCanvasImgData";
import { drawCutOutBox } from "@/lib/features/canvas/drawing/DrawCutOutBox";
import { drawText } from "@/lib/features/canvas/drawing/DrawText";
import { addHistory } from "@/lib/features/canvas/state/AddHistoryData";
import { UserToolbarCallback } from "@/lib/type/components/toolbar";
import cropBoxStore from "@/store/CropBoxStore";
import toolBarStore from "@/store/ToolBarStore";
import textInputStore from "@/store/TextInputStore";
import screenShotCanvasStore from "@/store/ScreenShotCanvasStore";
import userParamStore from "@/store/UserParamStore";
import { ToolName } from "@/lib/type/editor/toolNames";
import drawingDataStore from "@/store/DrawingDataStore";
import screenDomStore from "@/store/dom/ScreenDomStore";
import toolPanelDomStore from "@/store/dom/ToolPanelDomStore";
import { destroyScreenShotDom } from "@/store/dom/domCleanup";
import { isTextContentEmpty } from "@/lib/shared/text/TextContentUtils";
import { removeEditingTextElement } from "@/lib/shared/canvas/TextEditingController";
import { persistTextElementSnapshot } from "@/lib/shared/canvas/TextElementSnapshot";
import { hideCanvasActiveElementBorder } from "@/lib/shared/canvas/CanvasElementEditUtils";

type ToolContext = {
  cropBoxStore: typeof cropBoxStore;
  toolBarStore: typeof toolBarStore;
  textInputStore: typeof textInputStore;
  screenDomStore: typeof screenDomStore;
  toolPanelDomStore: typeof toolPanelDomStore;
  screenShotCanvasStore: typeof screenShotCanvasStore;
  userParamStore: typeof userParamStore;
  drawingDataStore: typeof drawingDataStore;
  destroyDom: () => void;
};

let toolContext: ToolContext = {
  cropBoxStore,
  toolBarStore,
  textInputStore,
  screenDomStore,
  toolPanelDomStore,
  screenShotCanvasStore,
  userParamStore,
  drawingDataStore,
  destroyDom: destroyScreenShotDom
};

export const configureToolContext = (overrides: Partial<ToolContext>) => {
  toolContext = { ...toolContext, ...overrides };
};

const ctx = () => toolContext;

function getToolbarContainer() {
  const {
    screenDomStore,
    screenShotCanvasStore
  } = ctx();
  const screenShotController = screenDomStore.screenShotController;
  const ScreenShotImageController = screenShotCanvasStore.imageController;
  if (screenShotController == null || ScreenShotImageController == null)
    return null;
  const screenShotCanvas = screenShotController.getContext(
    "2d"
  ) as CanvasRenderingContext2D;
  return {
    screenShotController,
    ScreenShotImageController,
    screenShotCanvas
  };
}

// 隐藏文本输入框
function hideTextInput(
  toolName: ToolName,
  screenShotCanvas: CanvasRenderingContext2D
) {
  const {
    screenDomStore,
    toolBarStore,
    textInputStore
  } = ctx();
  const textInputController = screenDomStore.textInputController;
  if (textInputController != null && toolName !== "text") {
    const text = textInputController.innerText;
    const hasText = !isTextContentEmpty(text);
    if (hasText) {
      const { positionX, positionY, color, size } = toolBarStore.textInfo;
      removeEditingTextElement();
      drawText(text, positionX, positionY, color, size, screenShotCanvas);
      persistTextElementSnapshot({
        text,
        mouseX: positionX,
        mouseY: positionY,
        color,
        fontSize: size,
        context: screenShotCanvas
      });
      // 添加历史记录
      addHistory();
    } else {
      const hadEditing = drawingDataStore.editingTextElementId != null;
      removeEditingTextElement();
      if (hadEditing) {
        addHistory();
      }
    }
    textInputController.innerHTML = "";
    textInputStore.setTextStatus(false);
    drawingDataStore.updateEditingTextElementId(null);
    drawingDataStore.updatePendingEditingTextElement(null);
  }
}

// 绘制无像素点的裁剪框
export function drawCutOutBoxWithoutPixel(
  screenShotCanvas: CanvasRenderingContext2D,
  screenShotController: HTMLCanvasElement,
  ScreenShotImageController: HTMLCanvasElement
) {
  const { toolBarStore, cropBoxStore } = ctx();
  toolBarStore.setToolStatus(true);
  // 获取裁剪框位置信息
  const cutBoxPosition = cropBoxStore.cutOutBoxPosition;
  // 开始绘制无像素点裁剪框
  drawCutOutBox(
    cutBoxPosition.startX,
    cutBoxPosition.startY,
    cutBoxPosition.width,
    cutBoxPosition.height,
    screenShotCanvas,
    cropBoxStore.borderSize,
    screenShotController as HTMLCanvasElement,
    ScreenShotImageController,
    false
  );
}

export function toolClickEvent(
  toolName: ToolName,
  index: number,
  mouseEvent: MouseEvent,
  completeCallback: Function | undefined,
  closeCallback: Function | undefined
) {
  const {
    toolBarStore,
    textInputStore,
    toolPanelDomStore,
    screenDomStore,
    cropBoxStore,
    userParamStore,
    drawingDataStore,
    destroyDom
  } = ctx();
  toolBarStore.setActiveToolName(toolName);
  toolBarStore.setToolId(index);
  const toolBarContainer = getToolbarContainer();
  if (toolBarContainer == null) {
    return;
  }
  const {
    screenShotController,
    ScreenShotImageController,
    screenShotCanvas
  } = toolBarContainer;
  // 工具栏尚未点击，当前属于首次点击，重新绘制一个无像素点的裁剪框
  if (!toolBarStore.toolClickStatus) {
    drawCutOutBoxWithoutPixel(
      screenShotCanvas,
      screenShotController,
      ScreenShotImageController
    );
  }
  // 设置裁剪框工具栏为点击状态
  toolBarStore.setToolClickStatus(true);
  // 更新当前点击的工具栏条目
  toolBarStore.setToolName(toolName);
  // 为当前点击项添加选中时的class名
  setSelectedClassName(mouseEvent, index, false);
  toolBarStore.syncOptionContent(toolName);
  toolBarStore.syncOptionLayout(index, toolName);
  // 清空文本输入区域的内容并隐藏文本输入框
  hideTextInput(toolName, screenShotCanvas);
  // 初始化点击状态
  cropBoxStore.setDragging(false);
  cropBoxStore.setDraggingTrim(false);

  handleToolAction(toolName, {
    completeCallback,
    closeCallback,
    cropBoxStore,
    destroyDom,
    drawingDataStore,
    screenDomStore,
    toolBarStore,
    userParamStore
  });
}

type ToolActionContext = {
  completeCallback: Function | undefined;
  closeCallback: Function | undefined;
  cropBoxStore: typeof cropBoxStore;
  destroyDom: () => void;
  drawingDataStore: typeof drawingDataStore;
  screenDomStore: typeof screenDomStore;
  toolBarStore: typeof toolBarStore;
  userParamStore: typeof userParamStore;
};

function handleToolAction(toolName: ToolName, context: ToolActionContext) {
  switch (toolName) {
    case "save": {
      const base64 = getCanvasImgData(true);
      const callback = context.userParamStore.saveCallback;
      if (callback) {
        callback(0, "保存成功", base64);
      }
      context.destroyDom();
      return;
    }
    case "close":
      if (context.closeCallback) {
        context.closeCallback();
      }
      context.destroyDom();
      return;
    case "confirm": {
      hideCanvasActiveElementBorder();
      const base64 = getCanvasImgData(false);
      context.completeCallback?.({
        base64,
        cutInfo: context.cropBoxStore.cutOutBoxPosition
      });
      if (!context.userParamStore.destroyContainer) {
        context.toolBarStore.setToolStatus(false);
        context.toolBarStore.setOptionStatus(false);
        return;
      }
      context.destroyDom();
      return;
    }
    case "undo":
      context.toolBarStore.setOptionStatus(false);
      context.drawingDataStore.undoHistory(
        context.screenDomStore.screenShotController?.getContext("2d"),
        () => {
          context.toolBarStore.setUndoStatus(false);
        }
      );
      return;
    default:
      return;
  }
}

// 处理用户自定义工具栏的点击事件
export function toolClickEventForUserDefined(
  index: number,
  toolName: ToolName,
  activeIcon: string,
  clickFn: UserToolbarCallback,
  mouseEvent: MouseEvent
) {
  const {
    toolBarStore,
    cropBoxStore
  } = ctx();
  toolBarStore.setActiveToolName(toolName);
  toolBarStore.setToolId(index);
  const target = mouseEvent.target as HTMLDivElement;
  target.style.backgroundImage = `url(${activeIcon})`;
  const toolBarContainer = getToolbarContainer();
  if (toolBarContainer == null) {
    return;
  }
  const {
    screenShotController,
    ScreenShotImageController,
    screenShotCanvas
  } = toolBarContainer;
  // 工具栏尚未点击，当前属于首次点击，重新绘制一个无像素点的裁剪框
  if (!toolBarStore.toolClickStatus) {
    drawCutOutBoxWithoutPixel(
      screenShotCanvas,
      screenShotController,
      ScreenShotImageController
    );
  }
  clickFn({
    screenShotCanvas,
    screenShotController,
    ScreenShotImageController,
    currentInfo: {
      toolName,
      toolId: index
    },
    imgInfo: {
      base64: getCanvasImgData(false),
      cutInfo: cropBoxStore.cutOutBoxPosition
    }
  });
  // 设置裁剪框工具栏为点击状态
  toolBarStore.setToolClickStatus(true);
  toolBarStore.setToolName(toolName);
  setSelectedClassName(mouseEvent, Number.MAX_VALUE, false);
  // 隐藏选项面板
  toolBarStore.setOptionStatus(false);
  hideTextInput(toolName, screenShotCanvas);
  // 初始化点击状态
  cropBoxStore.setDragging(false);
  cropBoxStore.setDraggingTrim(false);
}
