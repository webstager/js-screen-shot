import { makeAutoObservable } from "mobx";
import { SelectionBorderNode } from "@/lib/type/components/cropBox";
import { CanvasElementSnapshot } from "@/lib/type/components/canvas";
import { DrawingStoreDataType } from "@/lib/type/components/stores";
import {
  isMouseInRectangle,
  isMouseInsideRectangle
} from "@/lib/features/canvas/utils/ShapeUtils";
import screenShotCanvasStore from "@/store/ScreenShotCanvasStore";
import {
  ArrowElement,
  CanvasElement,
  CustomCanvasElement,
  LineArrowElement,
  MosaicElement,
  PencilElement,
  RoundElement,
  SquareElement,
  TextElement
} from "@/lib/type/editor/canvasElements";
import { drawRectangle } from "@/lib/features/canvas/drawing/DrawRectangle";
import {
  isMouseOnCircleBorder,
  redrawCircle
} from "@/lib/features/canvas/drawing/DrawCircle";
import {
  drawArrowElement,
  isMouseOnArrow
} from "@/lib/features/canvas/utils/ArrowUtils";
import { drawTextElement } from "@/lib/features/canvas/drawing/DrawText";
import { drawBrushElement } from "@/lib/features/canvas/drawing/DrawPencil";
import { drawMosaicElement } from "@/lib/features/canvas/drawing/DrawMosaic";
import {
  drawCustomCanvasElement,
  isCustomCanvasElementSnapshot,
  isMouseInCustomCanvasElement
} from "@/lib/shared/canvas/CustomCanvasElementUtils";
import { initializeStoreState } from "@/store/utils/initializeStore";
import { registerStoreReset } from "@/store/utils/resetRegistry";
import { CropBoxBorderOption } from "@/lib/constants/cropBoxOptions";
import { LINE_DASH } from "@/lib/constants/text";
import { logger } from "@/lib/utils/Logger";

class DrawingDataStore {
  private initialState(): DrawingStoreDataType {
    return {
      dpr: window.devicePixelRatio || 1,
      getFullScreenStatus: false,
      // 裁剪框边框节点坐标事件
      selectionBorderNodes: [],
      // webrtc模式下的屏幕流数据
      captureStream: null,
      // 点击裁剪框时的鼠标坐标
      movePosition: {
        moveStartX: 0,
        moveStartY: 0
      },
      history: [],
      // 当前操作的边框节点
      borderOption: null,
      // 鼠标是否在裁剪框内
      mouseInsideCropBox: false,
      // 临时图形位置参数
      tempGraphPosition: {
        startX: 0,
        startY: 0,
        width: 0,
        height: 0
      },
      // 文本输入框位置
      textInputPosition: {
        mouseX: 0,
        mouseY: 0
      },
      // 上一个裁剪框坐标信息
      drawGraphPrevX: 0,
      drawGraphPrevY: 0,
      drawStatus: false,
      // 马赛克涂抹区域大小
      degreeOfBlur: 5,
      resetAllStore: false,
      canUndo: true,
      canvasElements: [],
      // 当前正在操作的元素id
      activeElementId: null,
      // 当前选中的矩形元素的操作节点索引
      rectOperateIndex: null,
      // 当前正在编辑的文本元素ID
      editingTextElementId: null,
      // 缓存正在编辑的文本元素
      pendingEditingTextElement: null
    };
  }

  dpr!: number;
  getFullScreenStatus!: boolean;
  selectionBorderNodes!: Array<SelectionBorderNode>;
  captureStream!: DrawingStoreDataType["captureStream"];
  // 画笔历史记录
  history!: Array<Record<string, any>>;
  movePosition!: DrawingStoreDataType["movePosition"];
  borderOption!: DrawingStoreDataType["borderOption"];
  // 鼠标是否处在裁剪框内
  mouseInsideCropBox!: boolean;
  tempGraphPosition!: DrawingStoreDataType["tempGraphPosition"];
  textInputPosition!: DrawingStoreDataType["textInputPosition"];
  drawGraphPrevX!: number;
  drawGraphPrevY!: number;
  drawStatus!: boolean;
  degreeOfBlur!: number;
  resetAllStore!: boolean;
  canUndo!: boolean;
  canvasElements!: DrawingStoreDataType["canvasElements"];
  activeElementId!: DrawingStoreDataType["activeElementId"];
  rectOperateIndex!: DrawingStoreDataType["rectOperateIndex"];
  editingTextElementId!: DrawingStoreDataType["editingTextElementId"];
  pendingEditingTextElement!: DrawingStoreDataType["pendingEditingTextElement"];

  private readonly applyInitialState: () => void;

  constructor() {
    this.applyInitialState = initializeStoreState(this, () =>
      this.initialState()
    );
    makeAutoObservable(this, {}, { autoBind: true });
    registerStoreReset(this.reset);
  }

  updateDpr(dpr: number) {
    this.dpr = dpr;
  }

  updateFullScreenStatus(status: boolean) {
    this.getFullScreenStatus = status;
  }

  resetCompState() {
    this.resetAllStore = true;
  }

  updateCanUndo(canUndo: boolean) {
    this.canUndo = canUndo;
  }

  updateSelectionBorderNodes(borderArr: Array<SelectionBorderNode>) {
    this.selectionBorderNodes = borderArr;
  }

  updateCaptureStream(captureStream: MediaStream) {
    this.captureStream = captureStream;
  }

  updateMovePosition(moveStartX: number, moveStartY: number) {
    this.movePosition = {
      moveStartX,
      moveStartY
    };
  }

  updateBorderOption(borderOption: CropBoxBorderOption | null) {
    this.borderOption = borderOption;
  }

  updateMouseInsideCropBox(insideState: boolean) {
    this.mouseInsideCropBox = insideState;
  }

  updateTempGraphPosition(
    startX: number,
    startY: number,
    width: number,
    height: number
  ) {
    this.tempGraphPosition = {
      startX,
      startY,
      width,
      height
    };
  }

  updateTextInputPosition(mouseX: number, mouseY: number) {
    this.textInputPosition = {
      mouseX,
      mouseY
    };
  }

  updateDrawGraphPrevInfo(x: number, y: number) {
    this.drawGraphPrevX = x;
    this.drawGraphPrevY = y;
  }

  updateDrawStatus(status: boolean) {
    this.drawStatus = status;
  }

  // 移除历史记录的第一个元素
  shiftHistory() {
    return this.history.shift();
  }

  // 移除历史记录的最后一个元素
  popHistory() {
    return this.history.pop();
  }

  undoHistory(
    screenShortCanvas: CanvasRenderingContext2D | null | undefined,
    disableUndo: () => void
  ) {
    this.popHistory();
    if (screenShortCanvas && this.history.length > 0) {
      const canvasData = this.history[this.history.length - 1];
      screenShortCanvas.putImageData(canvasData["data"], 0, 0);
      this.replaceCanvasElements(canvasData["canvasElements"]);
    }
    if (this.history.length <= 1) {
      disableUndo();
    }
  }

  addElement(element: CanvasElementSnapshot) {
    this.canvasElements.push(element);
  }

  removeElement(id: CanvasElementSnapshot["id"]) {
    this.canvasElements = this.canvasElements.filter(item => item.id !== id);
  }

  updateCanvasElement(element: CanvasElement) {
    for (let i = 0; i < this.canvasElements.length; i++) {
      const canvasElement = this.canvasElements[i];
      if (canvasElement.id === element.id) {
        // 文本元素如果更新时缺少有效宽高，沿用旧值防止被误置为 0
        if (canvasElement.type === "text" && canvasElement.element) {
          const prev = canvasElement.element as TextElement;
          const next = element as TextElement;
          const merged: TextElement = {
            ...prev,
            ...next,
            width:
              (next.width ?? 0) === 0 && prev.width ? prev.width : next.width,
            height:
              (next.height ?? 0) === 0 && prev.height
                ? prev.height
                : next.height
          };
          element = merged as CanvasElement;
        }
        this.canvasElements[i] = {
          ...this.canvasElements[i],
          element: element
        };
      }
    }
  }

  clearEmptyCanvasElements(callback: (filteredLength: number) => void) {
    const validElements = this.canvasElements.filter(item => {
      const element = item.element;
      if (element == null) return false;
      // 文本元素依赖内容而非宽高，避免被误删
      if (item.type === "text") {
        logger.debug("文本信息", element);
        return true;
      }
      if ("width" in element && "height" in element) {
        return (element.width ?? 0) !== 0 || (element.height ?? 0) !== 0;
      }
      return true;
    });
    callback(validElements.length);
    this.canvasElements = validElements;
  }

  // 替换画布元素
  replaceCanvasElements(elements: Array<CanvasElementSnapshot>) {
    this.canvasElements = elements;
  }

  // 校验鼠标是否处于元素上
  checkMouseInElement(
    x: number,
    y: number,
    callback: (elementId: string | null) => void
  ) {
    for (let i = 0; i < this.canvasElements.length; i++) {
      const canvasElement = this.canvasElements[i];
      if (canvasElement.element != null) {
        switch (canvasElement.type) {
          // 矩形元素的判断
          case "square":
            {
              const {
                x: mouseX,
                y: mouseY,
                width,
                height,
                borderWidth
              } = canvasElement.element as SquareElement;
              const isInside = isMouseInRectangle(
                x,
                y,
                {
                  x: mouseX,
                  y: mouseY,
                  width,
                  height
                },
                borderWidth
              );
              if (isInside) {
                callback(canvasElement.id);
                return;
              }
            }
            break;
          case "round":
            {
              const {
                x: mouseX,
                y: mouseY,
                width,
                height,
                borderWidth
              } = canvasElement.element as RoundElement;
              const isInside = isMouseOnCircleBorder(
                x,
                y,
                {
                  x: mouseX,
                  y: mouseY,
                  width,
                  height
                },
                borderWidth
              );
              if (isInside) {
                callback(canvasElement.id);
                return;
              }
            }
            break;
          case "right-top":
            {
              const arrowElement = canvasElement.element as
                | LineArrowElement
                | ArrowElement;
              const tolerance = Math.max(
                arrowElement.borderWidth,
                arrowElement.dotRadius ?? 0,
                8
              );
              const isInside = isMouseOnArrow(x, y, arrowElement, tolerance);
              if (isInside) {
                callback(canvasElement.id);
                return;
              }
            }
            break;
          case "text":
            {
              const textElement = canvasElement.element as TextElement;
              const isInside = isMouseInsideRectangle(
                {
                  startX: textElement.x,
                  startY: textElement.y,
                  width: textElement.width,
                  height: textElement.height
                },
                {
                  mouseX: x,
                  mouseY: y
                }
              );
              if (isInside) {
                callback(canvasElement.id);
                return;
              }
            }
            break;
          case "brush":
            {
              const brushElement = canvasElement.element as PencilElement;
              const isInsideBrush = isMouseInsideRectangle(
                {
                  startX: brushElement.x,
                  startY: brushElement.y,
                  width: Math.max(brushElement.width, brushElement.size),
                  height: Math.max(brushElement.height, brushElement.size)
                },
                {
                  mouseX: x,
                  mouseY: y
                }
              );
              if (isInsideBrush) {
                callback(canvasElement.id);
                return;
              }
            }
            break;
          case "custom":
            {
              const customElement = canvasElement.element as CustomCanvasElement;
              if (isMouseInCustomCanvasElement(customElement, x, y)) {
                callback(canvasElement.id);
                return;
              }
            }
            break;
          default:
            if (isCustomCanvasElementSnapshot(canvasElement)) {
              const customElement = canvasElement.element as CustomCanvasElement;
              if (isMouseInCustomCanvasElement(customElement, x, y)) {
                callback(canvasElement.id);
                return;
              }
            }
            break;
        }
      }
    }
    callback(null);
  }

  // 重置画布内的元素边框节点
  resetCanvasElementNodeState() {
    for (let i = 0; i < this.canvasElements.length; i++) {
      const canvasElement = this.canvasElements[i];
      if (canvasElement.element?.drawNode) {
        canvasElement.element.drawNode = false;
      }
    }
  }

  findTextElementAt(x: number, y: number) {
    for (let i = 0; i < this.canvasElements.length; i++) {
      const elementSnapshot = this.canvasElements[i];
      if (elementSnapshot.type !== "text" || elementSnapshot.element == null) {
        continue;
      }
      const textElement = elementSnapshot.element as TextElement;
      const isInside = isMouseInsideRectangle(
        {
          startX: textElement.x,
          startY: textElement.y,
          width: textElement.width,
          height: textElement.height
        },
        { mouseX: x, mouseY: y }
      );
      if (isInside) {
        return elementSnapshot;
      }
    }
    return null;
  }

  // 重新绘制画布内的元素
  redrawCanvasElements() {
    for (let i = 0; i < this.canvasElements.length; i++) {
      const canvasElement = this.canvasElements[i];
      switch (canvasElement.type) {
        case "square":
          const squareElement = canvasElement.element as SquareElement;
          drawRectangle(
            squareElement.x,
            squareElement.y,
            squareElement.width,
            squareElement.height,
            squareElement.color,
            squareElement.borderWidth,
            screenShotCanvasStore.screenShotCanvas as CanvasRenderingContext2D,
            {
              dotRadius: squareElement?.dotRadius || 0,
              drawState: squareElement?.drawNode || false
            }
          );
          break;
        case "round":
          const roundElement = canvasElement.element as RoundElement;
          redrawCircle(
            screenShotCanvasStore.screenShotCanvas as CanvasRenderingContext2D,
            {
              x: roundElement.x,
              y: roundElement.y,
              width: roundElement.width,
              height: roundElement.height
            },
            roundElement.borderWidth,
            roundElement.color,
            roundElement.drawNode
              ? {
                  drawState: true,
                  dotRadius: roundElement.dotRadius || 0
                }
              : undefined
          );
          break;
        case "right-top":
          const arrowElement = canvasElement.element as
            | LineArrowElement
            | ArrowElement;
          drawArrowElement(
            screenShotCanvasStore.screenShotCanvas as CanvasRenderingContext2D,
            arrowElement,
            arrowElement.drawNode
              ? {
                  drawState: true,
                  dotRadius: arrowElement.dotRadius || 0
                }
              : undefined
          );
          break;
        case "brush":
          const brushElement = canvasElement.element as PencilElement;
          const brushContext = screenShotCanvasStore.screenShotCanvas as CanvasRenderingContext2D;
          drawBrushElement(brushElement, brushContext);
          if (brushElement.drawNode) {
            const brushDotRadius = brushElement.dotRadius ?? 0;
            const brushDrawDots =
              brushDotRadius > 0
                ? {
                    drawState: true,
                    dotRadius: brushDotRadius
                  }
                : undefined;
            drawRectangle(
              brushElement.x,
              brushElement.y,
              brushElement.width,
              brushElement.height,
              brushElement.color,
              Math.max(1, Math.min(brushElement.size, 4)),
              brushContext,
              brushDrawDots,
              LINE_DASH
            );
          }
          break;
        case "mosaicPen":
          const mosaicElement = canvasElement.element as MosaicElement;
          const mosaicContext = screenShotCanvasStore.screenShotCanvas as CanvasRenderingContext2D;
          drawMosaicElement(mosaicElement, mosaicContext);
          if (mosaicElement.drawNode) {
            const mosaicDotRadius = mosaicElement.dotRadius ?? 0;
            const mosaicDrawDots =
              mosaicDotRadius > 0
                ? {
                    drawState: true,
                    dotRadius: mosaicDotRadius
                  }
                : undefined;
            drawRectangle(
              mosaicElement.x,
              mosaicElement.y,
              mosaicElement.width,
              mosaicElement.height,
              mosaicElement.color,
              Math.max(1, Math.min(mosaicElement.size, 4)),
              mosaicContext,
              mosaicDrawDots
            );
          }
          break;
        case "text":
          const textElement = canvasElement.element as TextElement;
          drawTextElement(
            textElement,
            screenShotCanvasStore.screenShotCanvas as CanvasRenderingContext2D
          );
          break;
        case "custom":
          drawCustomCanvasElement(
            canvasElement.element as CustomCanvasElement,
            screenShotCanvasStore.screenShotCanvas as CanvasRenderingContext2D
          );
          break;
        default:
          if (isCustomCanvasElementSnapshot(canvasElement)) {
            drawCustomCanvasElement(
              canvasElement.element as CustomCanvasElement,
              screenShotCanvasStore.screenShotCanvas as CanvasRenderingContext2D
            );
          }
          break;
      }
    }
  }

  getCanvasElement(id: CanvasElementSnapshot["id"]) {
    return this.canvasElements.find(item => item.id === id);
  }

  // 更新正在操作的元素id
  updateActiveElementId(id: CanvasElementSnapshot["id"] | null) {
    this.activeElementId = id;
  }

  updateRectOperateIndex(index: number | null) {
    this.rectOperateIndex = index;
  }

  updateEditingTextElementId(id: string | null) {
    this.editingTextElementId = id;
  }

  updatePendingEditingTextElement(element: TextElement | null) {
    this.pendingEditingTextElement = element;
  }

  // 添加历史记录
  pushHistory(item: Record<string, any>) {
    this.history.push(item);
  }

  // 重置状态
  reset() {
    this.applyInitialState();
  }
}

const drawingDataStore = new DrawingDataStore();

export default drawingDataStore;
