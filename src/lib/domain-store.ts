const KEY = "traduzai_domain";

export function getSavedDomain(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(KEY);
}

export function saveDomain(slug: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, slug);
}

export function clearDomain(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}
