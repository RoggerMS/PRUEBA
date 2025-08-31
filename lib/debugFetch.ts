// Logs notification API requests in development while delegating to the native fetch.
export function debugFetch(input: RequestInfo | URL, init?: RequestInit) {
  if (process.env.NODE_ENV !== 'production') {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : '';
    if (url.includes('/api/notifications')) {
      console.count('fetch /api/notifications');
    }
  }
  return fetch(input, init);
}
