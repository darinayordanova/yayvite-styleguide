import type { Ref } from 'react';

/** Assigns a node to a forwarded ref, whether it is a callback or an object ref. */
export function setRef<T>(ref: Ref<T> | undefined, node: T | null): void {
  if (typeof ref === 'function') ref(node);
  else if (ref) ref.current = node;
}
