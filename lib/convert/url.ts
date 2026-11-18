/** http(s) 주소인지 검사한다. 통과하면 정규화된 URL 객체를 돌려준다. */
export function parseWebUrl(value: string): URL | null {
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (!url.hostname.includes(".")) return null;
    return url;
  } catch {
    return null;
  }
}
