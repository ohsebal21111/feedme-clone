import { Defuddle } from "defuddle/node";
import { parseHTML } from "linkedom";

import type { ConvertedDocument, ConvertErrorCode } from "./types";

export class ConvertError extends Error {
  constructor(public code: ConvertErrorCode) {
    super(code);
  }
}

const FETCH_TIMEOUT_MS = 15_000;

function formatPublished(value: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.getUTCFullYear()}년 ${date.getUTCMonth() + 1}월 ${date.getUTCDate()}일`;
}

/** URL의 페이지를 가져와 defuddle로 본문을 Markdown으로 추출한다. 서버에서만 호출한다. */
export async function convertUrlToMarkdown(url: URL): Promise<ConvertedDocument> {
  let html: string;
  try {
    const response = await fetch(url, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (compatible; feedme/1.0; +https://github.com/feedme)",
        accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!response.ok) throw new ConvertError("fetch");
    html = await response.text();
  } catch (error) {
    if (error instanceof ConvertError) throw error;
    throw new ConvertError("fetch");
  }

  const { document } = parseHTML(html);
  const result = await Defuddle(document as unknown as Document, url.href, {
    markdown: true,
  });

  const markdown = (result.content ?? "").trim();
  if (!markdown) throw new ConvertError("empty");

  const domain = url.hostname.replace(/^www\./, "");
  return {
    title: result.title?.trim() || domain,
    author: result.author?.trim() || null,
    site: result.site?.trim() || null,
    domain,
    url: url.href,
    published: formatPublished(result.published),
    markdown,
  };
}
