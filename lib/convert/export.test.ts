import { describe, expect, test } from "vitest";

import {
  buildFileName,
  buildSendText,
  planOpen,
  QUERY_LIMIT,
} from "./export";
import { parseWebUrl } from "./url";

describe("buildSendText", () => {
  test("프롬프트를 본문 앞에 붙인다", () => {
    expect(buildSendText("요약해줘", "본문")).toBe("요약해줘\n\n본문");
  });
  test("프롬프트가 비어 있으면 본문만 돌려준다", () => {
    expect(buildSendText("  ", "본문")).toBe("본문");
  });
});

describe("planOpen", () => {
  test("한도 이내면 ?q= 쿼리로 직접 전달한다", () => {
    const plan = planOpen("chatgpt", "요약해줘", "짧은 글");
    expect(plan.mode).toBe("query");
    expect(plan.url).toBe(
      `https://chatgpt.com/?q=${encodeURIComponent("요약해줘\n\n짧은 글")}`,
    );
  });
  test("Claude는 /new?q= 로 보낸다", () => {
    expect(planOpen("claude", "", "글").url).toBe("https://claude.ai/new?q=%EA%B8%80");
  });
  test("한도를 넘으면 전체 텍스트를 클립보드로 보내고 빈 새 대화를 연다", () => {
    const markdown = "가".repeat(QUERY_LIMIT);
    const plan = planOpen("claude", "요약해줘", markdown);
    expect(plan).toEqual({
      mode: "clipboard",
      url: "https://claude.ai/new",
      text: `요약해줘\n\n${markdown}`,
    });
  });
});

describe("buildFileName", () => {
  test("제목에서 파일명을 만든다", () => {
    expect(buildFileName("Use the saw, fear the saw", "stephango.com")).toBe(
      "Use-the-saw,-fear-the-saw.md",
    );
  });
  test("금지 문자는 제거하고, 만들 수 없으면 도메인을 쓴다", () => {
    expect(buildFileName('a/b:c?', "x.com")).toBe("a-b-c.md");
    expect(buildFileName("???", "x.com")).toBe("x.com.md");
  });
});

describe("parseWebUrl", () => {
  test("http와 https 주소만 허용한다", () => {
    expect(parseWebUrl("https://stephango.com/saw")?.hostname).toBe("stephango.com");
    expect(parseWebUrl("ftp://a.com")).toBeNull();
    expect(parseWebUrl("not a url")).toBeNull();
    expect(parseWebUrl("https://localhost")).toBeNull();
  });
});
