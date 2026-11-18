"use client";

import { useState } from "react";
import { CopyIcon, DownloadIcon, ExternalLinkIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  buildFileName,
  CHAT_SERVICES,
  planOpen,
  type ChatService,
} from "@/lib/convert/export";
import type { ConvertedDocument } from "@/lib/convert/types";

import { MarkdownView } from "./markdown-view";

const CHIP =
  "rounded-full data-pressed:border-primary data-pressed:bg-primary data-pressed:text-primary-foreground";
const NONE = "none";
const CUSTOM = "custom";
const PRESETS = ["요약해줘", "한국어로 번역해줘", "쉽게 설명해줘"];

function formatChars(count: number) {
  return `${count.toLocaleString("ko-KR")}자`;
}

export function ResultCard({ doc }: { doc: ConvertedDocument }) {
  const [choice, setChoice] = useState(NONE);
  const [customPrompt, setCustomPrompt] = useState("");

  const prompt =
    choice === NONE ? "" : choice === CUSTOM ? customPrompt.trim() : choice;
  const byline = doc.author || doc.site || doc.domain;

  async function copy() {
    try {
      await navigator.clipboard.writeText(doc.markdown);
      toast.success("Markdown을 복사했어요", {
        description: formatChars(doc.markdown.length),
      });
    } catch {
      toast.error("복사하지 못했어요", {
        description: "브라우저의 클립보드 권한을 확인해 주세요.",
      });
    }
  }

  function download() {
    const fileName = buildFileName(doc.title, doc.domain);
    const url = URL.createObjectURL(
      new Blob([doc.markdown], { type: "text/markdown;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("파일을 저장했어요", { description: fileName });
  }

  async function openIn(service: ChatService) {
    const plan = planOpen(service, prompt, doc.markdown);
    const label = CHAT_SERVICES[service].label;
    if (plan.mode === "query") {
      window.open(plan.url, "_blank", "noopener,noreferrer");
      toast.success(`${label} 새 탭을 열었어요`, {
        description: `${prompt ? `“${prompt}” + 본문` : "본문"}이 입력창에 채워져 있어요.`,
      });
      return;
    }
    // 클릭 직후 동기적으로 탭을 열어야 팝업 차단을 피한다.
    const copied = navigator.clipboard.writeText(plan.text);
    window.open(plan.url, "_blank", "noopener,noreferrer");
    try {
      await copied;
      toast.info("글이 길어서 클립보드에 복사했어요", {
        description: `${label} 새 대화에서 Ctrl+V로 붙여넣으세요. (${formatChars(plan.text.length)})`,
        duration: 7000,
      });
    } catch {
      toast.error("클립보드에 복사하지 못했어요", {
        description: "‘복사하기’로 직접 복사한 뒤 붙여넣어 주세요.",
      });
    }
  }

  return (
    <Card className="gap-0 py-0">
      <CardHeader className="gap-1.5 px-5 py-5">
        <CardTitle className="text-xl leading-snug text-pretty">
          {doc.title}
        </CardTitle>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-muted-foreground">
          <span className="font-medium text-foreground">{byline}</span>
          {doc.author && doc.site && doc.site !== doc.author ? (
            <>
              <Dot />
              <span>{doc.site}</span>
            </>
          ) : null}
          {doc.published ? (
            <>
              <Dot />
              <span>{doc.published}</span>
            </>
          ) : null}
          <Dot />
          <a
            href={doc.url}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4 [overflow-wrap:anywhere]"
          >
            {doc.domain}
          </a>
          <Dot />
          <span>{formatChars(doc.markdown.length)}</span>
        </div>
      </CardHeader>
      <Separator />
      <div className="flex flex-col gap-3.5 bg-muted/50 px-5 py-4">
        <div className="flex flex-col gap-2">
          <p id="prompt-label" className="text-[13px] font-medium">
            앞에 붙일 프롬프트
          </p>
          <ToggleGroup
            aria-labelledby="prompt-label"
            variant="outline"
            spacing={1}
            className="flex-wrap"
            value={[choice]}
            onValueChange={(next) => {
              if (next[0]) setChoice(next[0]);
            }}
          >
            <ToggleGroupItem value={NONE} className={CHIP}>선택 안 함</ToggleGroupItem>
            {PRESETS.map((preset) => (
              <ToggleGroupItem key={preset} value={preset} className={CHIP}>
                {preset}
              </ToggleGroupItem>
            ))}
            <ToggleGroupItem value={CUSTOM} className={CHIP}>직접 입력</ToggleGroupItem>
          </ToggleGroup>
          {choice === CUSTOM ? (
            <Input
              autoFocus
              value={customPrompt}
              onChange={(event) => setCustomPrompt(event.target.value)}
              placeholder="예: 핵심 주장 3가지와 반론을 정리해줘"
              aria-label="직접 입력한 프롬프트"
            />
          ) : null}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-2 max-sm:w-full">
            <Button className="max-sm:flex-1" onClick={() => openIn("chatgpt")}>
              <ExternalLinkIcon data-icon="inline-start" />
              ChatGPT로 열기
            </Button>
            <Button className="max-sm:flex-1" onClick={() => openIn("claude")}>
              <ExternalLinkIcon data-icon="inline-start" />
              Claude로 열기
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 max-sm:w-full">
            <Button variant="outline" className="max-sm:flex-1" onClick={copy}>
              <CopyIcon data-icon="inline-start" />
              복사하기
            </Button>
            <Button
              variant="outline"
              className="max-sm:flex-1"
              onClick={download}
            >
              <DownloadIcon data-icon="inline-start" />
              .md 다운로드
            </Button>
          </div>
        </div>
      </div>
      <Separator />
      <MarkdownView markdown={doc.markdown} />
    </Card>
  );
}

function Dot() {
  return (
    <span aria-hidden className="size-[3px] rounded-full bg-current opacity-60" />
  );
}
