export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage = `Operation timed out after ${timeoutMs}ms`
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    ),
  ]);
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelayMs = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt === maxRetries) {
        throw lastError;
      }

      const delayMs = baseDelayMs * Math.pow(2, attempt);
      console.warn(
        `Attempt ${attempt + 1} failed, retrying in ${delayMs}ms:`,
        lastError.message
      );
      await delay(delayMs);
    }
  }

  throw lastError!;
}
