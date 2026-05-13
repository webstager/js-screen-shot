import CreateDom from "@/lib/application/CreateDom";
// 导入截图所需样式
import "@/assets/scss/screen-shot.scss";
import { CanvasEventHandlers } from "@/lib/type/components/events";
import { ScreenShotOptions } from "@/lib/type/components/screenshot";
import cropBoxStore from "@/store/CropBoxStore";
import { DrawArrow } from "@/lib/features/canvas/drawing/DrawArrow";

import KeyboardEventHandle from "@/lib/features/canvas/events/KeyboardEventHandle";
import { setPlugInParameters } from "@/lib/features/canvas/config/SetPlugInParameters";
import { getCanvas2dCtx } from "@/lib/shared/canvas/CanvasPatch";

import { isTouchDevice } from "@/lib/shared/platform/DeviceTypeVerif";
import toolBarStore from "@/store/ToolBarStore";
import textInputStore from "@/store/TextInputStore";
import screenShotCanvasStore from "@/store/ScreenShotCanvasStore";
import userParamStore from "@/store/UserParamStore";
import { setOptionalParameter } from "@/lib/features/canvas/config/SetOptionalParameter";
import {
  adjustContainerLevels,
  registerContainerShortcuts,
  registerForRightClickEvent,
  resolveScreenShotPlan,
  setScreenShotContainerSize,
  executeLoadPlan
} from "@/lib/application/LoadCoreComponents";
import drawingDataStore from "@/store/DrawingDataStore";
import { CanvasElementSnapshot } from "@/lib/type/components/canvas";
import {
  handleCanvasPointerDown,
  handleCanvasPointerMove,
  handleCanvasPointerUp
} from "@/lib/application/CanvasPointerHandlers";
import { operatingCutOutBox } from "@/lib/application/mouse/CutOutBoxMouseHandler";
import observeStore from "@/store/StoreObserver";
import screenDomStore from "@/store/dom/ScreenDomStore";
import toolPanelDomStore from "@/store/dom/ToolPanelDomStore";
import { destroyScreenShotDom } from "@/store/dom/domCleanup";
import type { CropBoxBounds } from "@/lib/type/components/cropBox";
import { isBrowserEnv } from "@/lib/shared/platform/BrowserEnv";

export default class ScreenShot {
  // 截图图片存放容器
  private screenShotImageController: HTMLCanvasElement;

  private keyboardEventHandle: null | KeyboardEventHandle = null;

  // 鼠标拖动状态
  private dragFlag = false;

  // 递增变粗箭头的实现
  private drawArrow = new DrawArrow();

  constructor(options: ScreenShotOptions) {
    if (!isBrowserEnv()) {
      throw new Error(
        "js-web-screen-shot must be instantiated in a browser environment."
      );
    }

    // 提取调用者传入的配置
    setPlugInParameters(options);
    // 创建截图所需dom并设置回调函数
    new CreateDom(options);
    // 创建webrtc模式所需要的辅助dom
    screenDomStore.initWebRtcDom();
    this.screenShotImageController = document.createElement("canvas");

    // 设置插件的可选参数
    setOptionalParameter(options);
    // 获取截图区域canvas容器，存储到store中
    screenDomStore.hydrateDomRefs();
    toolPanelDomStore.hydrateDomRefs();

    // 加载截图组件
    this.load(options);
  }

  // 加载截图组件
  private load(options: ScreenShotOptions) {
    const { triggerCallback, cancelCallback } = options;
    const finalizeLoad = () => {
      if (
        toolPanelDomStore.toolController == null ||
        screenDomStore.screenShotController == null ||
        screenDomStore.textInputController == null
      ) {
        return;
      }
      adjustContainerLevels(options.level ?? 0);
      // 添加键盘事件监听
      this.keyboardEventHandle = new KeyboardEventHandle(
        screenDomStore.screenShotController,
        toolPanelDomStore.toolController
      );
      // 文本输入框添加键盘事件监听
      registerContainerShortcuts(screenDomStore.textInputController);
      if (userParamStore.customRightClickEvent.state) {
        registerForRightClickEvent(screenDomStore.screenShotController);
      }
      observeStore();
    };

    setScreenShotContainerSize(this.screenShotImageController);
    let context:CanvasRenderingContext2D | null = null;
    if(screenDomStore.screenShotController!=null) {
      context = getCanvas2dCtx(
        screenDomStore.screenShotController,
        this.screenShotImageController.width,
        this.screenShotImageController.height
      );
    }
    if (context == null) {
      return;
    }
    // 显示截图区域容器
    screenDomStore.showScreenShotPanel();

    const mouseEvents: CanvasEventHandlers = {
      mouseDownEvent: this.mouseDownEvent,
      mouseMoveEvent: this.mouseMoveEvent,
      mouseUpEvent: this.mouseUpEvent
    };

    // 获取截图模式，调用与之对应的方法做最后的加载工作
    const plan = resolveScreenShotPlan();
    executeLoadPlan(
      plan,
      mouseEvents,
      context,
      triggerCallback,
      cancelCallback,
      () => this.screenShotImageController,
      canvas => {
        this.screenShotImageController = canvas;
      }
    );
    finalizeLoad();
  }

  // 鼠标按下事件
  private mouseDownEvent = (event: MouseEvent | TouchEvent) => {
    // 隐藏颜色选择面板
    toolBarStore.setColorPanelStatus(false);
    // 隐藏文字大小选择面板
    textInputStore.setTextSizeOptionStatus(false);
    // 非鼠标左键按下则终止
    if (event instanceof MouseEvent && event.button != 0) return;

    // 当前处于移动端触摸时，需要在按下时判断当前坐标点是否处于裁剪框内，主动更新draggingTrim状态（移动端的move事件只会在按下时才会触发）
    if (
      isTouchDevice() &&
      event instanceof TouchEvent &&
      screenShotCanvasStore.screenShotCanvas
    ) {
      operatingCutOutBox(
        event.touches[0].pageX,
        event.touches[0].pageY,
        drawingDataStore.tempGraphPosition.startX,
        drawingDataStore.tempGraphPosition.startY,
        drawingDataStore.tempGraphPosition.width,
        drawingDataStore.tempGraphPosition.height,
        screenShotCanvasStore.screenShotCanvas,
        this.screenShotImageController
      );
    }
    // 当前操作的是撤销
    if (toolBarStore.toolName == "undo") return;
    cropBoxStore.setDragging(true);
    drawingDataStore.updateDrawStatus(false);
    handleCanvasPointerDown(event);
  };

  // 鼠标移动事件
  private mouseMoveEvent = (event: MouseEvent | TouchEvent) => {
    if (toolBarStore.toolName == "undo") {
      return;
    }
    // 去除默认事件
    event.preventDefault();

    // 工具栏未选择且鼠标处于按下状态时
    if (!toolBarStore.toolClickStatus && cropBoxStore.dragging) {
      // 修改拖动状态为true;
      this.dragFlag = true;
      // 隐藏截图工具栏
      toolBarStore.setToolStatus(false);
      // 隐藏裁剪框尺寸显示容器
      cropBoxStore.setCutBoxSizeStatus(false);
    }
    handleCanvasPointerMove(
      event,
      this.screenShotImageController,
      this.drawArrow
    );
  };

  // 鼠标抬起事件
  private mouseUpEvent = () => {
    // 当前操作的是撤销
    if (toolBarStore.toolName == "undo") return;
    // 绘制结束
    cropBoxStore.setDragging(false);
    cropBoxStore.setDraggingTrim(false);
    handleCanvasPointerUp(
      this.dragFlag,
      this.screenShotImageController,
      () => {
        this.dragFlag = false;
      }
    );
  };

  // 销毁组件方法
  public destroyComponents(): void {
    destroyScreenShotDom();
  }

  // 确认截图方法
  public completeScreenshot() {
    if (this.keyboardEventHandle) {
      this.keyboardEventHandle.triggerEvent("confirm");
    }
  }

  // 获取画布中存储的元素位置信息
  public getCanvasElementsPosition(): Array<CanvasElementSnapshot> {
    return JSON.parse(JSON.stringify(drawingDataStore.canvasElements));
  }

  // 获取当前裁剪框位置信息
  public getCutBoxInfo(): CropBoxBounds {
    return JSON.parse(JSON.stringify(cropBoxStore.cutOutBoxPosition));
  }
}
