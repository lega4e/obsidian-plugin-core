import ValueNotifier from "./value_notifier";

export default class DerivedValueNotifier<T> extends ValueNotifier<T> {
  private derivedListeners: Set<() => void> = new Set();

  constructor(
    private notifiers: ValueNotifier<any>[],
    private calc: (notifiers: ValueNotifier<any>[], currentValue: T | null) => T
  ) {
    super(calc(notifiers, null));

    for (const notifier of notifiers) {
      const derivedListener = notifier.listen(() => this.update());
      this.derivedListeners.add(derivedListener);
    }
  }

  dispose() {
    this.derivedListeners.forEach((listener) => listener());
  }

  update() {
    this.state = this.calc(this.notifiers, this.state);
  }
}
