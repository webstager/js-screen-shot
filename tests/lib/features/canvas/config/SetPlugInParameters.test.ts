import { setPlugInParameters } from "@/lib/features/canvas/config/SetPlugInParameters";
import userParamStore from "@/store/UserParamStore";
import { resetAllStores } from "@/store/utils/resetRegistry";

describe("SetPlugInParameters", () => {
  beforeEach(() => {
    resetAllStores();
  });

  afterEach(() => {
    resetAllStores();
  });

  test("会写入 Electron 菜单栏高度配置", () => {
    setPlugInParameters({ menuBarHeight: 22 });

    expect(userParamStore.menuBarHeight).toBe(22);
  });
});
