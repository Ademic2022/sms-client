import { useState, type Dispatch, type SetStateAction } from "react";

/**
 * Local, editable state that is re-initialised whenever `source` changes (for example a
 * form seeded from fetched data). Uses React's "adjust state during render" pattern rather
 * than an effect, so there is no extra render with stale values.
 */
export function useDerivedState<S, T>(source: S | undefined | null, derive: (source: S, previous: T) => T, initial: T): [T, Dispatch<SetStateAction<T>>] {
  const [state, setState] = useState<T>(initial);
  const [seen, setSeen] = useState<S | undefined | null>(undefined);
  if (source !== undefined && source !== null && source !== seen) {
    setSeen(source);
    setState(derive(source, state));
  }
  return [state, setState];
}
