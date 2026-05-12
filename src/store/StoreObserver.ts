// 监听store中的数据变化
import { IReactionDisposer, reaction, runInAction } from "mobx";
import drawingDataStore from "@/store/DrawingDataStore";
import toolBarStore from "@/store/ToolBarStore";
import { resetAllStores } from "@/store/utils/resetRegistry";

let observerDisposers: IReactionDisposer[] = [];

export const disposeStoreObservers = () => {
  observerDisposers.forEach(dispose => dispose());
  observerDisposers = [];
};

const observeStore = () => {
  disposeStoreObservers();
  observerDisposers = [
    reaction(
      () => drawingDataStore.resetAllStore,
      state => {
        if (state) {
          // 重置所有store
          runInAction(resetAllStores);
        }
      }
    ),
    reaction(
      () => drawingDataStore.canUndo,
      isDisable => {
        if (!isDisable) {
          // 更新工具栏的撤销图标为禁用状态
          toolBarStore.setUndoStatus(false);
        }
      }
    )
  ];
  return disposeStoreObservers;
};

export default observeStore;
