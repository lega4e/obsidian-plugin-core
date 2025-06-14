type Listener<T> = (state: T) => void;

export default class ValueNotifier<T> {
  private _state: T;
  private listeners: Set<Listener<T>> = new Set();

  constructor(initialState: T) {
    this._state = initialState;
  }

  listen(listener: Listener<T>, initialCall: boolean = false): () => void {
    this.listeners.add(listener);
    if (initialCall) {
      listener(this._state);
    }

    return () => {
      this.listeners.delete(listener);
    };
  }

  get state(): T {
    return this._state;
  }

  set state(newState: T) {
    this._state = newState;
    this.notify();
  }

  notify() {
    this.listeners.forEach((listener) => listener(this._state));
  }
}
