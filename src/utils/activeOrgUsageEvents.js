const EVENT_NAME = 'active-org-usage-refresh';

export function emitActiveOrgUsageRefresh() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(EVENT_NAME));
  }
}

export function subscribeActiveOrgUsageRefresh(handler) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(EVENT_NAME, handler);
  return () => window.removeEventListener(EVENT_NAME, handler);
}
