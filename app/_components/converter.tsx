"use client";

import { useRef, useState } from "react";
import { AlertCircleIcon, LinkIcon, Loader2Icon, XIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CONVERT_ERRORS,
  type ConvertedDocument,
  type ConvertErrorCode,
} from "@/lib/convert/types";
import { parseWebUrl } from "@/lib/convert/url";

import { ResultCard } from "./result-card";
import { ThemeToggle } from "./theme-toggle";

type View =
  | { kind: "home" }
  | { kind: "loading" }
  | { kind: "result"; doc: ConvertedDocument }
  | { kind: "error"; code: ConvertErrorCode };

const EXAMPLES = [
  { label: "블로그 글", url: "https://stephango.com/saw" },
  { label: "위키 문서", url: "https://ko.wikipedia.org/wiki/마크다운" },
  { label: "제품 블로그", url: "https://nextjs.org/blog/next-16" },
];
const EXAMPLE_URL = EXAMPLES[0].url;

export function Converter() {
  const [url, setUrl] = useState("");
  const [view, setView] = useState<View>({ kind: "home" });
  const [inputError, setInputError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  // 늦게 도착한 응답이 지우기 이후 화면을 덮지 않게 요청마다 번호를 매긴다.
  const requestId = useRef(0);

  const isHome = view.kind === "home";
  const isLoading = view.kind === "loading";

  async function convert(target: string) {
    const parsed = parseWebUrl(target);
    if (!parsed) {
      setInputError(true);
      inputRef.current?.focus();
      return;
    }
    setInputError(false);
    const id = ++requestId.current;
    setView({ kind: "loading" });
    try {
      const response = await fetch("/api/convert", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: parsed.href }),
      });
      const data = await response.json();
      if (id !== requestId.current) return;
      if (!response.ok) {
        setView({ kind: "error", code: data.error ?? "fetch" });
      } else {
        setView({ kind: "result", doc: data });
      }
    } catch {
      if (id === requestId.current) setView({ kind: "error", code: "fetch" });
    }
  }

  function runExample(example: string) {
    setUrl(example);
    void convert(example);
  }

  function clearAll() {
    requestId.current++;
    setUrl("");
    setInputError(false);
    setView({ kind: "home" });
    inputRef.current?.focus();
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-3">
      <header
        className={`flex items-center justify-between border-b pb-3 ${isHome ? "border-transparent" : "border-border"}`}
      >
        <div
          className={`flex items-center gap-2 font-semibold ${isHome ? "invisible" : ""}`}
        >
          <span className="grid size-6 place-items-center rounded-md bg-primary font-mono text-xs text-primary-foreground">
            fm
          </span>
          feedme
        </div>
        <ThemeToggle />
      </header>

      <main
        className={`mx-auto flex w-full max-w-3xl flex-col gap-6 ${isHome ? "flex-1 items-center justify-center pb-[12vh] text-center" : "py-8"}`}
      >
        {isHome ? (
          <div>
            <h1 className="text-6xl font-bold tracking-tighter max-sm:text-5xl">
              feedme
            </h1>
            <p className="mt-3 text-[15px] text-muted-foreground">
              웹 페이지를 Markdown으로, 바로 LLM에게
            </p>
          </div>
        ) : null}

        <form
          noValidate
          className="flex w-full flex-col gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            void convert(url);
          }}
        >
          <div
            className={
              isHome
                ? "mx-auto w-full max-w-xl"
                : "flex flex-col gap-2 sm:flex-row"
            }
          >
            <div className="relative min-w-0 flex-1">
              <LinkIcon
                aria-hidden
                className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-muted-foreground ${isHome ? "left-4 size-[18px]" : "left-3 size-4"}`}
              />
              <Input
                ref={inputRef}
                type="url"
                inputMode="url"
                autoComplete="off"
                placeholder="https://example.com/article"
                aria-label="웹 페이지 URL"
                aria-invalid={inputError}
                aria-describedby="url-error"
                readOnly={isLoading}
                value={url}
                onChange={(event) => {
                  setUrl(event.target.value);
                  setInputError(false);
                }}
                className={
                  isHome
                    ? "h-12 rounded-full pr-12 pl-11 text-base"
                    : "pr-10 pl-9"
                }
              />
              {url ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="지우기"
                  title="지우기"
                  onClick={clearAll}
                  className="absolute top-1/2 right-2 -translate-y-1/2"
                >
                  <XIcon />
                </Button>
              ) : null}
            </div>
            {!isHome ? (
              <Button
                type="submit"
                disabled={isLoading}
                className="max-sm:w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2Icon
                      className="animate-spin"
                      data-icon="inline-start"
                    />
                    변환 중…
                  </>
                ) : (
                  "변환하기"
                )}
              </Button>
            ) : null}
          </div>
          {inputError ? (
            <p
              id="url-error"
              role="alert"
              className={`text-[13px] text-destructive ${isHome ? "text-center" : ""}`}
            >
              {CONVERT_ERRORS.invalid.description}
            </p>
          ) : null}
          {isHome ? (
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              <Button type="submit" variant="secondary">
                Markdown으로 변환
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => runExample(EXAMPLE_URL)}
              >
                예시로 해보기
              </Button>
            </div>
          ) : null}
        </form>

        {isHome ? (
          <p className="text-[13px] text-muted-foreground">
            예시:{" "}
            {EXAMPLES.map((example, index) => (
              <span key={example.url}>
                {index > 0 ? " · " : ""}
                <button
                  type="button"
                  onClick={() => runExample(example.url)}
                  className="text-foreground underline underline-offset-4"
                >
                  {example.label}
                </button>
              </span>
            ))}
          </p>
        ) : null}

        {view.kind === "loading" ? (
          <Card aria-busy="true" className="gap-0 py-0">
            <div className="flex flex-col gap-2.5 p-5">
              <Skeleton className="h-[22px] w-[70%]" />
              <Skeleton className="h-3.5 w-[40%]" />
            </div>
            <Separator />
            <div className="flex flex-col gap-2.5 p-5">
              <Skeleton className="h-3.5" />
              <Skeleton className="h-3.5 w-[94%]" />
              <Skeleton className="h-3.5 w-[88%]" />
              <Skeleton className="h-3.5 w-[60%]" />
            </div>
          </Card>
        ) : null}

        {view.kind === "error" ? (
          <Alert variant="destructive">
            <AlertCircleIcon />
            <AlertTitle>{CONVERT_ERRORS[view.code].title}</AlertTitle>
            <AlertDescription>
              {CONVERT_ERRORS[view.code].description}
            </AlertDescription>
          </Alert>
        ) : null}

        {view.kind === "result" ? (
          <ResultCard key={view.doc.url} doc={view.doc} />
        ) : null}
      </main>
    </div>
  );
}
