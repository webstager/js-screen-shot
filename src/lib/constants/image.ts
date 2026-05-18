import type { CanvasExportType } from "@/lib/type/components/screenshot";

export const DEFAULT_CANVAS_EXPORT_TYPE: CanvasExportType = "image/png";

// 导出截图时的默认画质（0~1 之间），兼顾清晰度与文件体积
export const DEFAULT_CANVAS_EXPORT_QUALITY = 0.75;

export const CANVAS_EXPORT_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp"
] as const;

export const CANVAS_EXPORT_FILE_EXTENSION_MAP: Record<
  CanvasExportType,
  string
> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp"
};
