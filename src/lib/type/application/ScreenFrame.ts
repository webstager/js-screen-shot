import { ScreenShotRenderStrategy } from "@/lib/type/application/ScreenShotPlan";

export type CanvasSize = {
  containerWidth: number;
  containerHeight: number;
  imgWidth: number;
  imgHeight: number;
};

export type DrawFrameParams = CanvasSize & {
  imgContext: CanvasRenderingContext2D;
  videoController: HTMLVideoElement;
};

export interface ScreenFrameDrawer {
  draw(params: DrawFrameParams): boolean;
}

export type { ScreenShotRenderStrategy };
