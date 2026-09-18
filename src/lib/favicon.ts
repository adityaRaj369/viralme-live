export function logoUrlForDomain(domain: string, size = 128) {
  const clean = domain.replace(/^www\./, "");
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(clean)}&sz=${size}`;
}

export function logoUrlFromHref(url?: string | null, size = 128) {
  if (!url) return null;
  try {
    const host = new URL(url.startsWith("http") ? url : `https://${url}`).hostname;
    return logoUrlForDomain(host, size);
  } catch {
    return null;
  }
}
