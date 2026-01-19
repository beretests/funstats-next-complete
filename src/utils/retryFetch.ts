export const retryFetch = async <T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> => {
  try {
    return await fn();
  } catch (error: unknown) {
    const status =
      (error as { response?: { status?: number } })?.response?.status ?? 0;
    if (status >= 500 && status < 600) {
      if (retries <= 0) throw error;

      console.log(
        `API call failed with status ${status}. Retrying in ${delay}ms...`
      );

      await new Promise((resolve) => setTimeout(resolve, delay));

      return retryFetch(fn, retries - 1, delay * 1.5);
    }

    throw error;
  }
};
