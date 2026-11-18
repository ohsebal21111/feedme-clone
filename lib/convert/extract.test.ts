// @vitest-environment node
import { afterEach, expect, test, vi } from "vitest";

import { ConvertError, convertUrlToMarkdown } from "./extract";

function stubFetch(body: string, status = 200) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response(body, { status })),
  );
}

afterEach(() => vi.unstubAllGlobals());

test("글 페이지에서 제목·저자·Markdown 본문을 추출한다", async () => {
  stubFetch(`<html><head><title>안녕 글</title>
    <meta name="author" content="홍길동"></head>
    <body><article><h1>안녕 글</h1><p>${"본문 문장입니다. ".repeat(30)}</p></article></body></html>`);

  const doc = await convertUrlToMarkdown(new URL("https://example.com/post"));

  expect(doc.title).toContain("안녕 글");
  expect(doc.author).toBe("홍길동");
  expect(doc.domain).toBe("example.com");
  expect(doc.markdown).toContain("본문 문장입니다.");
});

test("본문이 없는 페이지는 empty 오류를 던진다", async () => {
  stubFetch("<html><head></head><body><div id='app'></div></body></html>");

  await expect(
    convertUrlToMarkdown(new URL("https://example.com/app")),
  ).rejects.toMatchObject({ code: "empty" });
});

test("응답 실패는 fetch 오류를 던진다", async () => {
  stubFetch("not found", 404);

  await expect(
    convertUrlToMarkdown(new URL("https://example.com/missing")),
  ).rejects.toBeInstanceOf(ConvertError);
});
