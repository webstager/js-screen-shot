// 裁剪框边框节点对应的操作类型，保持与老逻辑的数值一致，便于序列化/通信
export enum CropBoxBorderOption {
  Move = 1,
  North = 2,
  South = 3,
  West = 4,
  East = 5,
  NorthWest = 6,
  SouthEast = 7,
  NorthEast = 8,
  SouthWest = 9
}

// 边框节点的样式/光标分组
export enum CropBoxBorderStyleIndex {
  Move = 1,
  VerticalResize = 2,
  HorizontalResize = 3,
  DiagonalResizeA = 4,
  DiagonalResizeB = 5
}

// 各类节点对应的 cursor 样式，配合 CropBoxBorderStyleIndex 使用
export const BORDER_CURSOR_STYLE: Record<CropBoxBorderStyleIndex, string> = {
  [CropBoxBorderStyleIndex.Move]: "move",
  [CropBoxBorderStyleIndex.VerticalResize]: "ns-resize",
  [CropBoxBorderStyleIndex.HorizontalResize]: "ew-resize",
  [CropBoxBorderStyleIndex.DiagonalResizeA]: "nwse-resize",
  [CropBoxBorderStyleIndex.DiagonalResizeB]: "nesw-resize"
};
