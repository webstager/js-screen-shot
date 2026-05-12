import {
  CropBoxBorderOption,
  CropBoxBorderStyleIndex
} from "@/lib/constants/cropBoxOptions";
import type { BorderTemplate } from "@/lib/type/components/cropBox";

export const CROP_BOX_BORDER_TEMPLATES: BorderTemplate[] = [
  // move
  {
    option: CropBoxBorderOption.Move,
    index: CropBoxBorderStyleIndex.Move,
    x: (ctx) => ctx.startX + ctx.halfBorderSize,
    y: (ctx) => ctx.startY + ctx.halfBorderSize,
    width: (ctx) => ctx.innerWidth,
    height: (ctx) => ctx.innerHeight
  },
  // n
  {
    option: CropBoxBorderOption.North,
    index: CropBoxBorderStyleIndex.VerticalResize,
    x: (ctx) => ctx.startX + ctx.halfBorderSize,
    y: (ctx) => ctx.startY,
    width: (ctx) => ctx.innerWidth,
    height: (ctx) => ctx.halfBorderSize
  },
  {
    option: CropBoxBorderOption.North,
    index: CropBoxBorderStyleIndex.VerticalResize,
    x: (ctx) => ctx.centerX - ctx.halfBorderSize,
    y: (ctx) => ctx.startY - ctx.halfBorderSize,
    width: (ctx) => ctx.borderSize,
    height: (ctx) => ctx.halfBorderSize
  },
  // s
  {
    option: CropBoxBorderOption.South,
    index: CropBoxBorderStyleIndex.VerticalResize,
    x: (ctx) => ctx.startX + ctx.halfBorderSize,
    y: (ctx) => ctx.endY - ctx.halfBorderSize,
    width: (ctx) => ctx.innerWidth,
    height: (ctx) => ctx.halfBorderSize
  },
  {
    option: CropBoxBorderOption.South,
    index: CropBoxBorderStyleIndex.VerticalResize,
    x: (ctx) => ctx.centerX - ctx.halfBorderSize,
    y: (ctx) => ctx.endY,
    width: (ctx) => ctx.borderSize,
    height: (ctx) => ctx.halfBorderSize
  },
  // w
  {
    option: CropBoxBorderOption.West,
    index: CropBoxBorderStyleIndex.HorizontalResize,
    x: (ctx) => ctx.startX,
    y: (ctx) => ctx.startY + ctx.halfBorderSize,
    width: (ctx) => ctx.halfBorderSize,
    height: (ctx) => ctx.innerHeight
  },
  {
    option: CropBoxBorderOption.West,
    index: CropBoxBorderStyleIndex.HorizontalResize,
    x: (ctx) => ctx.startX - ctx.halfBorderSize,
    y: (ctx) => ctx.centerY - ctx.halfBorderSize,
    width: (ctx) => ctx.halfBorderSize,
    height: (ctx) => ctx.borderSize
  },
  // e
  {
    option: CropBoxBorderOption.East,
    index: CropBoxBorderStyleIndex.HorizontalResize,
    x: (ctx) => ctx.endX - ctx.halfBorderSize,
    y: (ctx) => ctx.startY + ctx.halfBorderSize,
    width: (ctx) => ctx.halfBorderSize,
    height: (ctx) => ctx.innerHeight
  },
  {
    option: CropBoxBorderOption.East,
    index: CropBoxBorderStyleIndex.HorizontalResize,
    x: (ctx) => ctx.endX,
    y: (ctx) => ctx.centerY - ctx.halfBorderSize,
    width: (ctx) => ctx.halfBorderSize,
    height: (ctx) => ctx.borderSize
  },
  // nw
  {
    option: CropBoxBorderOption.NorthWest,
    index: CropBoxBorderStyleIndex.DiagonalResizeA,
    x: (ctx) => ctx.startX - ctx.halfBorderSize,
    y: (ctx) => ctx.startY - ctx.halfBorderSize,
    width: (ctx) => ctx.borderSize,
    height: (ctx) => ctx.borderSize
  },
  // se
  {
    option: CropBoxBorderOption.SouthEast,
    index: CropBoxBorderStyleIndex.DiagonalResizeA,
    x: (ctx) => ctx.endX - ctx.halfBorderSize,
    y: (ctx) => ctx.endY - ctx.halfBorderSize,
    width: (ctx) => ctx.borderSize,
    height: (ctx) => ctx.borderSize
  },
  // ne
  {
    option: CropBoxBorderOption.NorthEast,
    index: CropBoxBorderStyleIndex.DiagonalResizeB,
    x: (ctx) => ctx.endX - ctx.halfBorderSize,
    y: (ctx) => ctx.startY - ctx.halfBorderSize,
    width: (ctx) => ctx.borderSize,
    height: (ctx) => ctx.borderSize
  },
  // sw
  {
    option: CropBoxBorderOption.SouthWest,
    index: CropBoxBorderStyleIndex.DiagonalResizeB,
    x: (ctx) => ctx.startX - ctx.halfBorderSize,
    y: (ctx) => ctx.endY - ctx.halfBorderSize,
    width: (ctx) => ctx.borderSize,
    height: (ctx) => ctx.borderSize
  }
];
