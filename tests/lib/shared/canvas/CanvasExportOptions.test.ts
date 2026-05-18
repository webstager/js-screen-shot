import {
  getCanvasExportFileExtension,
  getCanvasExportTypeFromDataUrl,
  normalizeCanvasExportOptions
} from "@/lib/shared/canvas/CanvasExportOptions";

describe("CanvasExportOptions", () => {
  test("会使用默认 PNG 导出配置", () => {
    expect(normalizeCanvasExportOptions()).toEqual({
      type: "image/png",
      quality: 0.75
    });
  });

  test("会裁剪导出质量并校验导出格式", () => {
    expect(
      normalizeCanvasExportOptions({
        type: "image/webp",
        quality: -0.2
      })
    ).toEqual({
      type: "image/webp",
      quality: 0
    });

    expect(
      normalizeCanvasExportOptions({
        type: "image/gif",
        quality: Number.NaN
      } as any)
    ).toEqual({
      type: "image/png",
      quality: 0.75
    });
  });

  test("会从 data url 解析实际导出类型并返回文件后缀", () => {
    expect(
      getCanvasExportTypeFromDataUrl("data:image/jpeg;base64,abc", "image/png")
    ).toBe("image/jpeg");
    expect(getCanvasExportFileExtension("image/jpeg")).toBe("jpg");
  });
});
