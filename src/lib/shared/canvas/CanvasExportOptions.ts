import {
  CANVAS_EXPORT_FILE_EXTENSION_MAP,
  CANVAS_EXPORT_TYPES,
  DEFAULT_CANVAS_EXPORT_QUALITY,
  DEFAULT_CANVAS_EXPORT_TYPE
} from "@/lib/constants/image";
import type {
  CanvasExportOptions,
  CanvasExportType
} from "@/lib/type/components/screenshot";

export const isSupportedCanvasExportType = (
  type: unknown
): type is CanvasExportType =>
  typeof type === "string" &&
  CANVAS_EXPORT_TYPES.includes(type as CanvasExportType);

export const normalizeCanvasExportOptions = (
  options?: CanvasExportOptions | null
): Required<CanvasExportOptions> => {
  const type = options?.type;
  const quality =
    typeof options?.quality === "number" && Number.isFinite(options.quality)
      ? Math.min(1, Math.max(0, options.quality))
      : DEFAULT_CANVAS_EXPORT_QUALITY;

  return {
    type: isSupportedCanvasExportType(type) ? type : DEFAULT_CANVAS_EXPORT_TYPE,
    quality
  };
};

export const getCanvasExportTypeFromDataUrl = (
  dataUrl: string,
  fallback: CanvasExportType
) => {
  const mimeType = /^data:([^;,]+)/.exec(dataUrl)?.[1];
  return isSupportedCanvasExportType(mimeType) ? mimeType : fallback;
};

export const getCanvasExportFileExtension = (type: CanvasExportType) =>
  CANVAS_EXPORT_FILE_EXTENSION_MAP[type];
