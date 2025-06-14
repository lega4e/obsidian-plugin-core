import ValueNotifier from "./value_notifier";

export default class DerivedValueNotifier<T> extends ValueNotifier<T> {
  private derivedListeners: Set<() => void> = new Set();

  constructor(
    notifiers: ValueNotifier<any>[],
    calc: (notifiers: ValueNotifier<any>[], currentValue: T | null) => T
  ) {
    super(calc(notifiers, null));

    for (const notifier of notifiers) {
      const derivedListener = notifier.listen((_) => {
        this.state = calc(notifiers, this.state);
      });
      this.derivedListeners.add(derivedListener);
    }
  }

  dispose() {
    this.derivedListeners.forEach((listener) => listener());
  }
}
