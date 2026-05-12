import { makeAutoObservable } from "mobx";
import { CropBoxStoreDataType } from "@/lib/type/components/stores";
import { getToolRelativePosition } from "@/lib/shared/dom/GetToolRelativePosition";
import { initializeStoreState } from "@/store/utils/initializeStore";
import { registerStoreReset } from "@/store/utils/resetRegistry";
import screenDomStore from "@/store/dom/ScreenDomStore";

class CropBoxStore {
  private initialState(): CropBoxStoreDataType {
    return {
      draggingTrim: false,
      dragging: false,
      borderSize: 10,
      cutOutBoxPosition: {
        startX: 0,
        startY: 0,
        width: 0,
        height: 0
      },
      drawGraphPosition: {
        startX: 0,
        startY: 0,
        width: 0,
        height: 0
      }
    };
  }

  // 可观察属性
  draggingTrim!: boolean;
  dragging!: boolean;
  borderSize!: number;
  cutOutBoxPosition!: CropBoxStoreDataType["cutOutBoxPosition"];
  drawGraphPosition!: CropBoxStoreDataType["drawGraphPosition"];

  private readonly applyInitialState: () => void;

  constructor() {
    this.applyInitialState = initializeStoreState(this, () => this.initialState());
    makeAutoObservable(this, {}, { autoBind: true });
    registerStoreReset(this.reset);
  }

  // 设置拖动裁剪状态
  setDraggingTrim(draggingTrim: boolean) {
    this.draggingTrim = draggingTrim;
  }

  // 设置拖动状态
  setDragging(dragging: boolean) {
    this.dragging = dragging;
  }

  // 设置裁剪框位置信息
  setCutOutBoxPosition(
    mouseX: number,
    mouseY: number,
    width: number,
    height: number
  ) {
    this.cutOutBoxPosition = {
      startX: mouseX,
      startY: mouseY,
      width,
      height
    };
  }

  // 设置裁剪框尺寸显示容器展示状态
  setCutBoxSizeStatus(status: boolean) {
    screenDomStore.updateCutBoxSizeShowState(status ? "flex" : "none");
  }

  // 设置裁剪框尺寸显示容器位置
  setCutBoxSizePosition(x: number, y: number) {
    const { left, top } = getToolRelativePosition(x, y);
    let sscTop = 0;
    if (screenDomStore.screenShotController) {
      sscTop = parseInt(screenDomStore.screenShotController.style.top);
    }
    screenDomStore.updateCutBoxSizePosition(left, top, sscTop);
  }

  // 设置裁剪框尺寸
  setCutBoxSize(width: number, height: number) {
    // width和height保留整数
    screenDomStore.updateCutBoxSizeInfo(
      Math.floor(width),
      Math.floor(height)
    );
  }

  updateDrawGraphPosition(
    mouseX?: number,
    mouseY?: number,
    width?: number,
    height?: number
  ) {
    // 创建 updates 对象，用于保存传入的参数值
    const updates: Record<string, number | undefined> = {
      mouseX,
      mouseY,
      width,
      height
    };
    // 创建映射对象，将传入的参数名称映射到 drawGraphPosition 对象的属性名称
    const mapping: Record<string, keyof typeof this.drawGraphPosition> = {
      mouseX: "startX",
      mouseY: "startY",
      width: "width",
      height: "height"
    };

    // 遍历 updates 对象，对每一个非 undefined 的值进行更新
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        this.drawGraphPosition[mapping[key as keyof typeof mapping]] = value;
      }
    });
  }

  // 重置状态
  reset() {
    this.applyInitialState();
  }
}

const cropBoxStore = new CropBoxStore();

export default cropBoxStore;
