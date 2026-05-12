// 普通画笔的尺寸映射，UI 使用 small/medium/big 这三个枚举值
export const BRUSH_SIZE_PRESETS = {
  small: 2,
  medium: 5,
  big: 10
} as const;

// 马赛克工具的笔触尺寸映射
export const MOSAIC_BRUSH_SIZE_PRESETS = {
  small: 10,
  medium: 20,
  big: 40
} as const;
