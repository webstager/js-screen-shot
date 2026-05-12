import { makeAutoObservable } from "mobx";
import { CanvasEventCallbacks } from "@/lib/type/components/events";
import { ScreenShotOptions } from "@/lib/type/components/screenshot";
import { UserParamStoreDataType } from "@/lib/type/components/stores";
import { UserToolbarItem } from "@/lib/type/components/toolbar";
import { initializeStoreState } from "@/store/utils/initializeStore";
import { registerStoreReset } from "@/store/utils/resetRegistry";
import { CanvasElementSnapshot } from "@/lib/type/components/canvas";
import type { CustomCanvasElementAdapter } from "@/lib/type/components/customElement";

class UserParamStore {
  private initialState(): UserParamStoreDataType {
    return {
      enableWebRtc: true,
      menuBarHeight: 0,
      clickCutFullScreen: false,
      imgSrc: null,
      loadCrossImg: false,
      proxyUrl: undefined,
      useCORS: false,
      h2cIgnoreElementsFn: () => false,
      position: { left: 0, top: 0 },
      wrcReplyTime: 500,
      cropBoxInfo: null,
      toolPosition: "center",
      wrcImgPosition: { x: 0, y: 0, w: 0, h: 0 },
      hiddenScrollBar: {
        color: "#000000",
        fillState: false,
        state: false,
        fillWidth: 0,
        fillHeight: 0
      },
      wrcWindowMode: false,
      customRightClickEvent: { state: false },
      screenFlow: null,
      canvasWidth: 0,
      canvasHeight: 0,
      showScreenData: false,
      screenShotDom: null,
      destroyContainer: true,
      maskColor: { r: 0, g: 0, b: 0, a: 0.6 },
      writeBase64: true,
      cutBoxBdColor: "#2CABFF",
      maxUndoNum: 15,
      useRatioArrow: false,
      imgAutoFit: false,
      useCustomImgSize: false,
      customImgSize: { w: 0, h: 0 },
      userToolbar: [],
      h2cCrossImgLoadErrFn: null,
      saveCallback: null,
      saveImgTitle: null,
      canvasEvents: null,
      customElementAdapters: [],
      renderOptions:{ x: 0, y: 0 },
      canvasElements: []
    };
  }

  enableWebRtc!: boolean;
  menuBarHeight!: number;
  clickCutFullScreen!: boolean;
  imgSrc!: UserParamStoreDataType["imgSrc"];
  loadCrossImg!: boolean;
  proxyUrl!: UserParamStoreDataType["proxyUrl"];
  useCORS!: boolean;
  h2cIgnoreElementsFn!: UserParamStoreDataType["h2cIgnoreElementsFn"];
  // 截图容器位置信息
  position!: UserParamStoreDataType["position"];
  wrcReplyTime!: number;
  cropBoxInfo!: UserParamStoreDataType["cropBoxInfo"];
  toolPosition!: UserParamStoreDataType["toolPosition"];
  wrcImgPosition!: UserParamStoreDataType["wrcImgPosition"];
  hiddenScrollBar!: UserParamStoreDataType["hiddenScrollBar"];
  wrcWindowMode!: boolean;
  customRightClickEvent!: UserParamStoreDataType["customRightClickEvent"];
  screenFlow!: UserParamStoreDataType["screenFlow"];
  private canvasWidth!: number;
  private canvasHeight!: number;
  showScreenData!: boolean;
  screenShotDom!: UserParamStoreDataType["screenShotDom"];
  destroyContainer!: boolean;
  maskColor!: UserParamStoreDataType["maskColor"];
  writeBase64!: boolean;
  cutBoxBdColor!: string;
  maxUndoNum!: number;
  useRatioArrow!: boolean;
  imgAutoFit!: boolean;
  useCustomImgSize!: boolean;
  customImgSize!: UserParamStoreDataType["customImgSize"];
  userToolbar!: UserParamStoreDataType["userToolbar"];
  h2cCrossImgLoadErrFn!: UserParamStoreDataType["h2cCrossImgLoadErrFn"];
  saveCallback!: UserParamStoreDataType["saveCallback"];
  saveImgTitle!: UserParamStoreDataType["saveImgTitle"];
  canvasEvents!: UserParamStoreDataType["canvasEvents"];
  customElementAdapters!: UserParamStoreDataType["customElementAdapters"];
  renderOptions!: UserParamStoreDataType["renderOptions"];
  canvasElements!: UserParamStoreDataType["canvasElements"];

  private readonly applyInitialState: () => void;

  constructor() {
    this.applyInitialState = initializeStoreState(this, () => this.initialState());
    makeAutoObservable(this, {}, { autoBind: true });
    registerStoreReset(this.reset);
  }

  // 设置 WebRTC 启用状态
  setWebRtcStatus(status: boolean) {
    this.enableWebRtc = status;
  }

  setMenuBarHeight(height: number) {
    this.menuBarHeight = height;
  }

  // 设置单击截全屏模式启用状态
  setClickCutFullScreenStatus(status: boolean) {
    this.clickCutFullScreen = status;
  }

  // 用户传入的图像内容
  setImgSrc(src: string) {
    this.imgSrc = src;
  }

  setLoadCrossImg(val: boolean) {
    this.loadCrossImg = val;
  }

  setProxyUrl(url: string) {
    this.proxyUrl = url;
  }

  setUseCORS(state: boolean) {
    this.useCORS = state;
  }

  setH2cIgnoreElementsFn(
    callback: UserParamStoreDataType["h2cIgnoreElementsFn"]
  ) {
    this.h2cIgnoreElementsFn = callback;
  }

  setPosition(position: UserParamStoreDataType["position"]) {
    this.position = {
      top: position.top,
      left: position.left
    };
  }

  setWrcReplyTime(time: number) {
    this.wrcReplyTime = time;
  }

  setCropBoxInfo(info: UserParamStoreDataType["cropBoxInfo"]) {
    this.cropBoxInfo = info;
  }

  setToolPosition(toolPosition: UserParamStoreDataType["toolPosition"]) {
    this.toolPosition = toolPosition;
  }

  setWrcImgPosition(imgPosition: UserParamStoreDataType["wrcImgPosition"]) {
    this.wrcImgPosition = imgPosition;
  }

  setHiddenScrollBar(barInfo: UserParamStoreDataType["hiddenScrollBar"]) {
    this.hiddenScrollBar = barInfo;
  }

  setWrcWindowMode(windowInfo: boolean) {
    this.wrcWindowMode = windowInfo;
  }

  setCustomRightClickEvent(
    data: UserParamStoreDataType["customRightClickEvent"]
  ) {
    this.customRightClickEvent = data;
  }

  // 设置截图 DOM
  setScreenShotDom(dom: HTMLElement) {
    this.screenShotDom = dom;
  }

  // 设置切割框边框颜色
  setCutBoxBdColor(color: string) {
    this.cutBoxBdColor = color;
  }

  // 设置屏幕流
  setScreenFlow(stream: MediaStream) {
    this.screenFlow = stream;
  }

  // 获取画布宽高
  getCanvasSize() {
    return { canvasWidth: this.canvasWidth, canvasHeight: this.canvasHeight };
  }

  // 设置画布宽高
  setCanvasSize(width: number, height: number) {
    this.canvasWidth = width;
    this.canvasHeight = height;
  }

  // 设置展示图片至容器的状态
  setShowScreenDataStatus(status: boolean) {
    this.showScreenData = status;
  }

  // 设置蒙层颜色
  setMaskColor(color: { r: number; g: number; b: number; a: number }) {
    this.maskColor = color;
  }

  // 设置截图数据的写入状态
  setWriteImgState(state: boolean) {
    this.writeBase64 = state;
  }

  // 设置保存回调函数
  setSaveCallback(saveFn: (code: number, msg: string,base64:string) => void) {
    this.saveCallback = saveFn;
  }

  // 设置最大撤销次数
  setMaxUndoNum(num: number) {
    this.maxUndoNum = num;
  }

  // 设置是否使用等比例箭头
  setRatioArrow(state: boolean) {
    this.useRatioArrow = state;
  }

  // 设置是否开启图片自适应
  setImgAutoFit(state: boolean) {
    this.imgAutoFit = state;
  }

  // 设置是否使用自定义图片大小
  setUseCustomImgSize(state: boolean, sizeInfo?: { w: number; h: number }) {
    if (state && sizeInfo) {
      this.useCustomImgSize = true;
      this.customImgSize = sizeInfo;
    } else {
      this.useCustomImgSize = false;
      this.customImgSize = this.initialState().customImgSize;
    }
  }

  // 获取自定义图片大小
  getCustomImgSize() {
    return {
      useCustomImgSize: this.useCustomImgSize,
      customImgSize: this.customImgSize
    };
  }

  // 设置保存图片标题
  setSaveImgTitle(title: string) {
    this.saveImgTitle = title;
  }

  // 设置是否销毁容器状态
  setDestroyContainerState(state: boolean) {
    this.destroyContainer = state;
  }

  // 设置用户工具栏
  setUserToolbar(toolbar: Array<UserToolbarItem>) {
    this.userToolbar = toolbar.map((item, index) => ({
      ...item,
      id: 100 + (index + 1)
    }));
  }

  // 设置图片加载错误回调函数
  setH2cCrossImgLoadErrFn(fn: ScreenShotOptions["h2cImgLoadErrCallback"]) {
    this.h2cCrossImgLoadErrFn = fn;
  }

  // 设置画布事件监听
  setCanvasEvents(event: CanvasEventCallbacks) {
    this.canvasEvents = event;
  }

  setCustomElementAdapters(adapters: Array<CustomCanvasElementAdapter>) {
    this.customElementAdapters = [...adapters];
  }

  getCustomElementAdapter(toolId?: number, toolName?: string) {
    return this.customElementAdapters.find(adapter => {
      const matchToolId =
        toolId != null && adapter.toolId != null && adapter.toolId === toolId;
      const matchToolName =
        toolName != null &&
        adapter.toolName != null &&
        adapter.toolName === toolName;
      return matchToolId || matchToolName;
    });
  }

  setCanvasElements(elements: Array<CanvasElementSnapshot>) {
    this.canvasElements = JSON.parse(JSON.stringify(elements));
  }

  getCanvasElements() {
    return JSON.parse(JSON.stringify(this.canvasElements));
  }

  setRenderOptions(position: UserParamStoreDataType["renderOptions"]) {
    this.renderOptions = { ...position };
  }

  // 获取画布事件监听
  getCanvasEvents() {
    return this.canvasEvents;
  }

  // 重置状态
  reset() {
    this.applyInitialState();
  }
}

const userParamStore = new UserParamStore();

export default userParamStore;
