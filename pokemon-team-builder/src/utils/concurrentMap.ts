export async function concurrentMap<T, U>(
  items: T[],
  fn: (item: T, index: number) => Promise<U | null>,
  concurrency: number,
  onProgress?: (done: number, total: number) => void
): Promise<(U | null)[]> {
  const out: (U | null)[] = new Array(items.length).fill(null);
  let cursor = 0;
  let done = 0;

  async function worker() {
    while (cursor < items.length) {
      const idx = cursor++;
      try {
        out[idx] = await fn(items[idx], idx);
      } catch {
        out[idx] = null;
      }
      done++;
      onProgress?.(done, items.length);
    }
  }

  await Promise.all(Array.from({ length: concurrency }, worker));
  return out;
}
