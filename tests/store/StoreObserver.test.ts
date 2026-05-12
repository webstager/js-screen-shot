const mockReaction = jest.fn();
const mockRunInAction = jest.fn((fn: () => void) => fn());

jest.mock("mobx", () => ({
  makeAutoObservable: jest.fn(),
  reaction: mockReaction,
  runInAction: mockRunInAction
}));

import observeStore, { disposeStoreObservers } from "@/store/StoreObserver";

describe("StoreObserver", () => {
  beforeEach(() => {
    mockReaction.mockReset();
    mockRunInAction.mockClear();
  });

  afterEach(() => {
    disposeStoreObservers();
  });

  test("重复 observeStore 会先释放旧 reaction，避免重复监听", () => {
    const firstResetDisposer = jest.fn();
    const firstUndoDisposer = jest.fn();
    const secondResetDisposer = jest.fn();
    const secondUndoDisposer = jest.fn();
    mockReaction
      .mockReturnValueOnce(firstResetDisposer)
      .mockReturnValueOnce(firstUndoDisposer)
      .mockReturnValueOnce(secondResetDisposer)
      .mockReturnValueOnce(secondUndoDisposer);

    observeStore();
    observeStore();

    expect(firstResetDisposer).toHaveBeenCalledTimes(1);
    expect(firstUndoDisposer).toHaveBeenCalledTimes(1);
    expect(secondResetDisposer).not.toHaveBeenCalled();
    expect(secondUndoDisposer).not.toHaveBeenCalled();

    disposeStoreObservers();

    expect(secondResetDisposer).toHaveBeenCalledTimes(1);
    expect(secondUndoDisposer).toHaveBeenCalledTimes(1);
  });
});
