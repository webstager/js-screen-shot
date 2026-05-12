import drawingDataStore from "@/store/DrawingDataStore";
import textInputStore from "@/store/TextInputStore";
import toolBarStore from "@/store/ToolBarStore";
import userParamStore from "@/store/UserParamStore";
import { TextToolContext } from "@/lib/type/mouse/TextToolContext";
import screenDomStore from "@/store/dom/ScreenDomStore";
import { removeEditingTextElement } from "@/lib/shared/canvas/TextEditingController";
import { TextElement } from "@/lib/type/editor/canvasElements";
import {
  resetTextClickTracking,
  shouldActivateTextEdit,
  isInteractingWithNonTextElement
} from "@/lib/shared/text/TextEditClickTracker";
import {
  applyTextInputStyles,
  scheduleTextPlacement
} from "@/lib/shared/text/TextInputPlacement";
import { finalizeTextInput } from "@/lib/shared/text/TextInputFinalizer";

const focusExistingTextElement = (
  textElement: TextElement,
  textId: string,
  textInputController: HTMLDivElement
) => {
  // 进入文本编辑态：先保存状态再移除旧的可视元素
  drawingDataStore.updateEditingTextElementId(textId);
  drawingDataStore.updatePendingEditingTextElement({ ...textElement });
  removeEditingTextElement({ retainEditingId: true });
  // 计算基线与左侧位置
  const baselineY = textElement.y + textElement.height / 2;
  const textMouseX = textElement.x;
  textInputStore.setTextStatus(true);
  applyTextInputStyles(
    textInputController,
    textMouseX + userParamStore.position.left,
    textElement.color,
    textElement.fontSize,
    textElement.text
  );
  toolBarStore.setFontSize(textElement.fontSize);
  toolBarStore.setSelectedColor(textElement.color);

  scheduleTextPlacement({
    controller: textInputController,
    canvasX: textMouseX,
    baselineY,
    color: textElement.color,
    fontSize: textElement.fontSize,
    selectExistingContent: true
  });
  resetTextClickTracking();
};

/**
 * 处理文本工具的交互
 * @param mouseX
 * @param mouseY
 * @param context
 * @return 执行结果Boolean
 */
export function handleTextToolInteraction(
  mouseX: number,
  mouseY: number,
  context: TextToolContext
): boolean {
  // 鼠标处于裁剪框之外
  if (!drawingDataStore.mouseInsideCropBox) {
    return true;
  }
  const { textInputController, canvasContext } = context;

  // 命中检测：是否有元素在鼠标下
  let hoveredElementId: string | null = null;
  drawingDataStore.checkMouseInElement(mouseX, mouseY, id => {
    hoveredElementId = id;
  });
  const hoveredElementSnapshot =
    hoveredElementId != null
      ? drawingDataStore.getCanvasElement(hoveredElementId)
      : null;
  const activeElementId = drawingDataStore.activeElementId;
  const activeElementSnapshot =
    activeElementId != null
      ? drawingDataStore.getCanvasElement(activeElementId)
      : null;

  if (
    isInteractingWithNonTextElement(
      hoveredElementSnapshot,
      activeElementSnapshot,
      screenDomStore.mousePointer
    )
  ) {
    // 当前与非文本元素交互直接退出
    return false;
  }

  // 显示文本输入框
  textInputStore.setTextStatus(true);
  const { mouseX: textX, mouseY: textY } = drawingDataStore.textInputPosition;
  // 若存在上一段未提交文本，先提交或清理
  if (textX !== 0 && textY !== 0 && textX !== mouseX && textY !== mouseY) {
    finalizeTextInput({
      controller: textInputController,
      canvasContext
    });
  }

  // 判断是否点击到已有文本
  const existingTextSnapshot = drawingDataStore.findTextElementAt(
    mouseX,
    mouseY
  );
  if (existingTextSnapshot != null && existingTextSnapshot.element != null) {
    const textElement = existingTextSnapshot.element as TextElement;
    if (shouldActivateTextEdit(existingTextSnapshot.id)) {
      // 二次点击同一文本：进入编辑
      focusExistingTextElement(
        textElement,
        existingTextSnapshot.id,
        textInputController
      );
    } else {
      drawingDataStore.updateActiveElementId(existingTextSnapshot.id);
      screenDomStore.setCursorStyle("move");
    }
    return false;
  }

  drawingDataStore.updateEditingTextElementId(null);
  drawingDataStore.updatePendingEditingTextElement(null);
  resetTextClickTracking();
  // 新建文本输入框定位
  const textMouseX = mouseX + userParamStore.position.left;
  applyTextInputStyles(
    textInputController,
    textMouseX,
    toolBarStore.selectedColor,
    toolBarStore.fontSize,
    ""
  );

  scheduleTextPlacement({
    controller: textInputController,
    canvasX: mouseX,
    baselineY: mouseY,
    color: toolBarStore.selectedColor,
    fontSize: toolBarStore.fontSize
  });

  return false;
}
