export interface ScreenStreamStrategy {
  acquireStream(): Promise<MediaStream | null>;
}
