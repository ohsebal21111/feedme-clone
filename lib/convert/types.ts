export type ConvertedDocument = {
  title: string;
  author: string | null;
  site: string | null;
  domain: string;
  url: string;
  published: string | null;
  markdown: string;
};

export type ConvertErrorCode = "invalid" | "fetch" | "empty";

export const CONVERT_ERRORS: Record<
  ConvertErrorCode,
  { title: string; description: string }
> = {
  invalid: {
    title: "주소 형식이 올바르지 않아요",
    description: "http:// 또는 https://로 시작하는 웹 페이지 주소를 입력해 주세요.",
  },
  fetch: {
    title: "페이지를 불러오지 못했어요",
    description:
      "주소가 맞는지, 로그인 없이 열리는 공개 페이지인지 확인해 주세요. (응답 없음 또는 404)",
  },
  empty: {
    title: "본문을 찾지 못했어요",
    description:
      "이 페이지에서 읽을 수 있는 글을 찾지 못했어요. 글 상세 페이지의 주소인지 확인해 주세요.",
  },
};
