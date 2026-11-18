/** ?q= 쿼리로 직접 넘길 수 있는 프롬프트+본문의 최대 글자 수(보수적 한도). */
export const QUERY_LIMIT = 6000;

export type ChatService = "chatgpt" | "claude";

export const CHAT_SERVICES: Record<
  ChatService,
  { label: string; newChatUrl: string; queryUrl: (text: string) => string }
> = {
  chatgpt: {
    label: "ChatGPT",
    newChatUrl: "https://chatgpt.com/",
    queryUrl: (text) => `https://chatgpt.com/?q=${encodeURIComponent(text)}`,
  },
  claude: {
    label: "Claude",
    newChatUrl: "https://claude.ai/new",
    queryUrl: (text) => `https://claude.ai/new?q=${encodeURIComponent(text)}`,
  },
};

/** 프롬프트(없으면 생략)를 본문 앞에 붙인다. */
export function buildSendText(prompt: string, markdown: string): string {
  const trimmed = prompt.trim();
  return trimmed ? `${trimmed}\n\n${markdown}` : markdown;
}

export type OpenPlan =
  | { mode: "query"; url: string }
  | { mode: "clipboard"; url: string; text: string };

/** 한도 이내면 쿼리로 직접 전달하고, 넘으면 클립보드 + 빈 새 대화로 보낸다. */
export function planOpen(
  service: ChatService,
  prompt: string,
  markdown: string,
): OpenPlan {
  const text = buildSendText(prompt, markdown);
  const config = CHAT_SERVICES[service];
  if (text.length <= QUERY_LIMIT) {
    return { mode: "query", url: config.queryUrl(text) };
  }
  return { mode: "clipboard", url: config.newChatUrl, text };
}

/** 페이지 제목으로 .md 파일명을 만든다. 만들 수 없으면 도메인을 쓴다. */
export function buildFileName(title: string, domain: string): string {
  const base = title
    .replace(/[\/:*?"<>|\u0000-\u001f]/g, " ")
    .replace(/\s+/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "")
    .slice(0, 80);
  return `${base || domain}.md`;
}
