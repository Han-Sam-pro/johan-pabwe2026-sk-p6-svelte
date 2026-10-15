import { writable } from "svelte/store";

/**
 * Hook input formulir berbasis Svelte store.
 *
 * Pemakaian di komponen:
 *   const email = useInput("");
 *   <input bind:value={$email} />
 *   email.reset();
 */
export function useInput(initialValue = "") {
  const store = writable(initialValue);

  return {
    subscribe: store.subscribe,
    set: store.set,
    reset: () => store.set(initialValue),
    handleChange: (event) => store.set(event.currentTarget.value),
  };
}
