"use client";

import { Copy } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useState } from "react";
import { QuizBlock } from "@/components/quiz-block";
import { cn } from "@/lib/utils";
import type { ContentBlock } from "@/types/models";

type Props = {
  blocks: ContentBlock[];
};

const calloutStyles: Record<string, string> = {
  definition: "border-sky-400/50 bg-sky-500/10",
  warning: "border-rose-400/50 bg-rose-500/10",
  tip: "border-emerald-400/50 bg-emerald-500/10",
  "key-concept": "border-amber-400/50 bg-amber-500/10",
};

export function ContentRenderer({ blocks }: Props) {
  return (
    <div className="content-prose">
      {blocks.map((block, index) => {
        if (block.type === "prose" || block.type === "example" || block.type === "summary") {
          return (
            <section key={`${block.type}-${index}`} className="my-7 text-stone-200">
              {block.type !== "prose" && (
                <p className="mb-2 text-xs uppercase tracking-[0.15em] text-stone-400">{block.type}</p>
              )}
              <ReactMarkdown>{block.text}</ReactMarkdown>
            </section>
          );
        }

        if (block.type === "callout") {
          return (
            <section
              key={`${block.type}-${index}`}
              className={cn("my-7 rounded-xl border-l-4 p-4", calloutStyles[block.variant] ?? calloutStyles.tip)}
            >
              <p className="mb-1 text-sm font-semibold text-stone-100">{block.title}</p>
              <p className="text-sm text-stone-200">{block.text}</p>
            </section>
          );
        }

        if (block.type === "code") {
          return <CodeBlock key={`${block.type}-${index}`} {...block} />;
        }

        if (block.type === "quiz") {
          return <QuizBlock key={`${block.type}-${index}`} {...block} />;
        }

        return null;
      })}
    </div>
  );
}

function CodeBlock({ language, code, caption }: { language: string; code: string; caption?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <section className="my-7 overflow-hidden rounded-xl border border-white/15 bg-black/30">
      <div className="flex items-center justify-between border-b border-white/10 px-3 py-2 text-xs text-stone-400">
        <span>{language}</span>
        <button
          type="button"
          onClick={async () => {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 1400);
          }}
          className="inline-flex items-center gap-1 rounded px-2 py-1 text-stone-300 transition hover:bg-white/10"
        >
          <Copy size={13} />
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-sm text-stone-200">
        <code>{code}</code>
      </pre>
      {caption && <p className="border-t border-white/10 px-3 py-2 text-xs text-stone-400">{caption}</p>}
    </section>
  );
}
