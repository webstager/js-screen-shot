import { makeAutoObservable } from "mobx";
import { ScreenShotCanvasStoreDataType } from "@/lib/type/components/stores";
import { initializeStoreState } from "@/store/utils/initializeStore";
import { registerStoreReset } from "@/store/utils/resetRegistry";

class ScreenShotCanvasStore {
  private initialState(): ScreenShotCanvasStoreDataType {
    return {
      imageController: null,
      screenShotCanvas: null
    };
  }

  // 存储获取到的屏幕截图
  imageController!: HTMLCanvasElement | null;
  screenShotCanvas!: CanvasRenderingContext2D | null;

  private readonly applyInitialState: () => void;

  constructor() {
    this.applyInitialState = initializeStoreState(this, () => this.initialState());
    makeAutoObservable(this, {}, { autoBind: true });
    registerStoreReset(this.reset);
  }

  updateScreenShotCanvas(screenShotCanvas: CanvasRenderingContext2D) {
    this.screenShotCanvas = screenShotCanvas;
  }

  // 设置截图画布控制器
  setImageController(imageController: HTMLCanvasElement) {
    this.imageController = imageController;
  }

  // 重置状态
  reset() {
    this.applyInitialState();
  }
}

const screenShotCanvasStore = new ScreenShotCanvasStore();

export default screenShotCanvasStore;
