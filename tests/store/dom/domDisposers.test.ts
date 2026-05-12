import {
  disposeDomDisposers,
  registerDomDisposer
} from "@/store/dom/domDisposers";

describe("domDisposers", () => {
  afterEach(() => {
    disposeDomDisposers();
  });

  test("disposeDomDisposers 会释放已注册的清理函数", () => {
    const first = jest.fn();
    const second = jest.fn();

    registerDomDisposer(first);
    registerDomDisposer(second);
    disposeDomDisposers();

    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);
  });

  test("重复释放不会再次调用已释放的清理函数", () => {
    const dispose = jest.fn();

    registerDomDisposer(dispose);
    disposeDomDisposers();
    disposeDomDisposers();

    expect(dispose).toHaveBeenCalledTimes(1);
  });

  test("单个 disposer 抛错时仍会继续释放其他 disposer", () => {
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    const first = jest.fn();
    const failed = jest.fn(() => {
      throw new Error("cleanup failed");
    });
    const last = jest.fn();

    registerDomDisposer(first);
    registerDomDisposer(failed);
    registerDomDisposer(last);
    disposeDomDisposers();

    expect(last).toHaveBeenCalledTimes(1);
    expect(failed).toHaveBeenCalledTimes(1);
    expect(first).toHaveBeenCalledTimes(1);
    expect(errorSpy).toHaveBeenCalledTimes(1);

    errorSpy.mockRestore();
  });
});
