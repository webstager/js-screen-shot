import { saveCanvasToBase64 } from "@/lib/shared/canvas/SaveCanvasToBase64";
import { saveCanvasToImage } from "@/lib/shared/canvas/SaveCanvasToImage";
import userParamStore from "@/store/UserParamStore";
import { resetAllStores } from "@/store/utils/resetRegistry";

describe("Canvas export", () => {
  let toDataURLSpy: jest.SpyInstance;
  let clickSpy: jest.SpyInstance;

  beforeEach(() => {
    resetAllStores();
    toDataURLSpy = jest
      .spyOn(HTMLCanvasElement.prototype, "toDataURL")
      .mockReturnValue("data:image/jpeg;base64,test");
    clickSpy = jest
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => undefined);
  });

  afterEach(() => {
    toDataURLSpy.mockRestore();
    clickSpy.mockRestore();
    resetAllStores();
    jest.restoreAllMocks();
  });

  test("saveCanvasToBase64 会按配置传入导出格式和质量", () => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d") as CanvasRenderingContext2D;

    const base64 = saveCanvasToBase64(
      context,
      0,
      0,
      10,
      10,
      0.6,
      false,
      "image/jpeg"
    );

    expect(base64).toBe("data:image/jpeg;base64,test");
    expect(toDataURLSpy).toHaveBeenCalledWith("image/jpeg", 0.6);
  });

  test("saveCanvasToImage 会按实际 data url 类型设置下载后缀", () => {
    const originalCreateElement = document.createElement.bind(document);
    const anchors: HTMLAnchorElement[] = [];
    jest.spyOn(document, "createElement").mockImplementation(tagName => {
      const element = originalCreateElement(tagName);
      if (tagName === "a") {
        anchors.push(element as HTMLAnchorElement);
      }
      return element;
    });
    userParamStore.setSaveImgTitle("capture");
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d") as CanvasRenderingContext2D;

    saveCanvasToImage(context, 0, 0, 10, 10, 0.4, "image/jpeg");

    expect(toDataURLSpy).toHaveBeenCalledWith("image/jpeg", 0.4);
    expect(anchors[0].download).toBe("capture.jpg");
    expect(clickSpy).toHaveBeenCalled();
  });
});
