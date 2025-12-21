import ValueNotifier from "./value_notifier";

export default class LazyDerivedValueNotifier<
  T
> extends ValueNotifier<T | null> {
  private derivedListeners: Set<() => void> = new Set();
  private _calculatedState: T | null = null;
  private _shouldCalculate: boolean = false;

  constructor(
    private notifiers: ValueNotifier<any>[],
    private calc: (notifiers: ValueNotifier<any>[], currentValue: T | null) => T
  ) {
    super(null);

    for (const notifier of notifiers) {
      const derivedListener = notifier.listen((_) => {
        this._shouldCalculate = true;
        this.notify();
      });
      this.derivedListeners.add(derivedListener);
    }
  }

  get state(): T {
    if (!this._calculatedState || this._shouldCalculate) {
      this.update();
    }
    return this._calculatedState!;
  }

  set state(newState: T) {
    this._calculatedState = newState;
    this._shouldCalculate = false;
    this.notify();
  }

  dispose() {
    this.derivedListeners.forEach((listener) => listener());
  }

  update() {
    this._calculatedState = this.calc(this.notifiers, this._calculatedState);
    this._shouldCalculate = false;
  }
}
