export async function fetchJson<T>(input: RequestInfo | URL, init?: RequestInit) {
  const response = await fetch(input, init);
  const text = await response.text();
  let data: T | null = null;
  if (text) {
    try {
      data = JSON.parse(text) as T;
    } catch {
      data = null;
    }
  }
  if (response.status === 401 && typeof window !== "undefined") {
    const path = window.location.pathname;
    const target = path.startsWith("/portal") ? "/portal/login" : "/";
    if (path !== target) {
      window.location.replace(target);
    }
  }
  return { response, data };
}
