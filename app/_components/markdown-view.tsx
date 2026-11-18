import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/** Markdown 원문을 렌더링된 형태로 보여 준다. */
export function MarkdownView({ markdown }: { markdown: string }) {
  return (
    <div className="px-5 pt-5 pb-7 text-[15px] leading-[1.7] wrap-break-word [&>:first-child]:mt-0 [&_a]:underline [&_a]:underline-offset-4 [&_blockquote]:mb-3.5 [&_blockquote]:border-l-4 [&_blockquote]:pl-3.5 [&_blockquote]:text-muted-foreground [&_code]:rounded [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-px [&_code]:font-mono [&_code]:text-[0.88em] [&_h1]:mt-7 [&_h1]:mb-2 [&_h1]:text-xl [&_h1]:font-semibold [&_h2]:mt-7 [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:mt-5 [&_h3]:mb-1.5 [&_h3]:text-base [&_h3]:font-semibold [&_img]:my-3.5 [&_img]:max-w-full [&_li]:my-1 [&_ol]:mb-3.5 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-3.5 [&_pre]:mb-3.5 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-muted [&_pre]:p-3.5 [&_pre]:text-[13px] [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_table]:w-full [&_table]:border-collapse [&_table]:text-sm [&_td]:border [&_td]:px-2.5 [&_td]:py-1.5 [&_td]:align-top [&_th]:border [&_th]:bg-muted [&_th]:px-2.5 [&_th]:py-1.5 [&_th]:text-left [&_ul]:mb-3.5 [&_ul]:list-disc [&_ul]:pl-6">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          a: ({ node, ...props }) => (
            <a {...props} target="_blank" rel="noopener noreferrer" />
          ),
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          table: ({ node, ...props }) => (
            <div className="mb-3.5 overflow-x-auto">
              <table {...props} />
            </div>
          ),
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
