import screenDomStore from "@/store/dom/ScreenDomStore";
import { ScreenStreamStrategy } from "@/lib/type/application/ScreenStream";

export class CaptureStreamStrategy implements ScreenStreamStrategy {
  constructor(
    private captureFn: () => Promise<MediaStream | null>
  ) {}

  acquireStream(): Promise<MediaStream | null> {
    return this.captureFn();
  }
}

export class InjectedStreamStrategy implements ScreenStreamStrategy {
  constructor(
    private stream: MediaStream | null,
    private onFailure: () => void
  ) {}

  acquireStream(): Promise<MediaStream | null> {
    if (this.stream instanceof MediaStream) {
      screenDomStore.setVideoSrcObject(this.stream);
      return Promise.resolve(this.stream);
    }
    this.onFailure();
    return Promise.resolve(null);
  }
}
