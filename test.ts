type Listener<T> = (state: T) => void;

class ValueNotifier<T> {
  private state: T;
  private listeners: Set<Listener<T>> = new Set();

  constructor(initialState: T) {
    this.state = initialState;
  }

  listen(listener: Listener<T>, initialCall: boolean = false) {
    this.listeners.add(listener);
    if (initialCall) {
      listener(this.state);
    }

    return () => {
      this.listeners.delete(listener);
    };
  }

  get value(): T {
    return this.state;
  }

  set value(newState: T) {
    if (this.state === newState) {
      return;
    }

    this.state = newState;
    this.notify();
  }

  notify() {
    this.listeners.forEach((listener) => listener(this.state));
  }
}

class DerivedValueNotifier<T> extends ValueNotifier<T> {
  private derivedListeners: Set<() => void> = new Set();

  constructor(
    notifiers: ValueNotifier<any>[],
    calc: (notifiers: ValueNotifier<any>[], currentValue: T | undefined) => T,
  ) {
    super(calc(notifiers, undefined));

    for (const notifier of notifiers) {
      let derivedListener = notifier.listen((_) => {
        this.value = calc(notifiers, this.value);
      });
      this.derivedListeners.add(derivedListener);
    }
  }

  dispose() {
    this.derivedListeners.forEach((listener) => listener());
  }
}

class SomePerson {
  constructor(
    public name: string,
    public age: number,
    public interests: string[],
  ) {}

  toString(): string {
    return `Name: ${this.name}, Age: ${this.age}, Interests: ${this.interests.join(", ")}`;
  }

  sayHello() {
    console.log(`Hello, my name is ${this.name}`);
  }
}

interface PersonPassport {
  name: string;
  code: string;
  full: string;
}

const person = new ValueNotifier<SomePerson>(
  new SomePerson("John", 30, ["reading", "traveling", "cooking"]),
);

const passport = new DerivedValueNotifier<PersonPassport>(
  [person],
  ([person], currentValue) => {
    return {
      name: person.value.name,
      code: currentValue?.code ?? "1234567890",
      full: currentValue?.full ?? "John Doe",
    };
  },
);

let listener = person.listen((person) => {
  console.log("person changed", person);
});

let listener2 = passport.listen((passport) => {
  console.log("passport changed", passport);
});

person.value.name = "Anna";
person.value.age = 25;
person.notify();

passport.value.code = "0987654321";
passport.notify();

// console.log(person.value);
// console.log(passport.value);