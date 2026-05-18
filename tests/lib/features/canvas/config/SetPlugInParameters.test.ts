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

  test("会写入并归一化导出图片配置", () => {
    setPlugInParameters({
      exportOptions: {
        type: "image/jpeg",
        quality: 1.5
      }
    });

    expect(userParamStore.exportOptions).toEqual({
      type: "image/jpeg",
      quality: 1
    });
  });

  test("会写入 SnapDOM 截图配置", () => {
    const snapdom = {
      toCanvas: jest.fn()
    };
    const snapdomOptions = { scale: 2, embedFonts: true };

    setPlugInParameters({
      capture: {
        source: "snapdom",
        snapdom,
        snapdomOptions
      }
    });

    expect(userParamStore.domRenderEngine).toBe("snapdom");
    expect(userParamStore.snapdom).toBe(snapdom);
    expect(userParamStore.snapdomOptions).toEqual(snapdomOptions);
  });

  test("会写入屏幕捕获鼠标配置", () => {
    setPlugInParameters({
      capture: {
        source: "display-media",
        cursor: "always"
      }
    });

    expect(userParamStore.captureCursor).toBe("always");
  });

  test("导出图片配置会忽略不支持的格式并保留默认值", () => {
    setPlugInParameters({
      exportOptions: {
        type: "image/gif",
        quality: -1
      } as any
    });

    expect(userParamStore.exportOptions).toEqual({
      type: "image/png",
      quality: 0
    });
  });
});
