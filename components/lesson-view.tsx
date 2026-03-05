"use client";

import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ContentRenderer } from "@/components/content-renderer";
import { readLocalProgress, setScrollPosition, setSubsectionCompleted } from "@/lib/local-progress";
import type { LessonContent } from "@/types/models";

type Props = {
  courseId: string;
  chapterOrder: number;
  subsectionOrder: number;
  subsectionId: string;
  chapterTitle: string;
  subsectionTitle: string;
  initialContent?: LessonContent;
  previousHref?: string;
  nextHref?: string;
  prefetchSubsectionIds?: string[];
};

type StreamMessage = {
  event: string;
  data: Record<string, unknown>;
};

function parseSseChunk(buffer: string): { messages: StreamMessage[]; rest: string } {
  const parts = buffer.split("\n\n");
  const rest = parts.pop() ?? "";
  const messages: StreamMessage[] = [];

  for (const part of parts) {
    const lines = part.split("\n");
    const eventLine = lines.find((line) => line.startsWith("event: "));
    const dataLine = lines.find((line) => line.startsWith("data: "));
    if (!eventLine || !dataLine) continue;
    try {
      messages.push({
        event: eventLine.replace("event: ", "").trim(),
        data: JSON.parse(dataLine.replace("data: ", "")) as Record<string, unknown>,
      });
    } catch {
      // Skip malformed chunks.
    }
  }

  return { messages, rest };
}

export function LessonView({
  courseId,
  chapterOrder,
  subsectionOrder,
  subsectionId,
  chapterTitle,
  subsectionTitle,
  initialContent,
  previousHref,
  nextHref,
  prefetchSubsectionIds = [],
}: Props) {
  const router = useRouter();
  const [content, setContent] = useState<LessonContent | null>(initialContent ?? null);
  const [status, setStatus] = useState<string | null>(initialContent ? null : "Generating lesson...");
  const [error, setError] = useState<string | null>(null);
  const [scrollPercent, setScrollPercent] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const markComplete = useCallback(async (completed: boolean) => {
    setIsComplete(completed);
    setSubsectionCompleted(courseId, subsectionId, completed);
    await fetch("/api/progress", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: "anonymous",
        courseId,
        subsectionId,
        completed,
        scrollPosition: Math.round(scrollPercent),
      }),
    }).catch(() => null);
  }, [courseId, scrollPercent, subsectionId]);

  useEffect(() => {
    const local = readLocalProgress(courseId);
    setIsComplete(!!local.completedSubsections[subsectionId]);
  }, [courseId, subsectionId]);

  useEffect(() => {
    if (content) return;
    let active = true;

    async function load() {
      try {
        const response = await fetch(`/api/courses/${courseId}/content`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subsectionId }),
        });

        if (!response.ok) {
          const body = (await response.json().catch(() => null)) as { error?: string } | null;
          throw new Error(body?.error ?? "Failed to load lesson content.");
        }

        const type = response.headers.get("content-type") ?? "";
        if (type.includes("application/json")) {
          const payload = (await response.json()) as { content: LessonContent };
          if (!active) return;
          setContent(payload.content);
          setStatus(null);
          return;
        }

        if (!response.body) throw new Error("No content stream returned.");
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (active) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const parsed = parseSseChunk(buffer);
          buffer = parsed.rest;

          for (const message of parsed.messages) {
            if (message.event === "status" && typeof message.data.message === "string") {
              setStatus(message.data.message);
            }
            if (message.event === "done") {
              if (message.data.content && typeof message.data.content === "object") {
                setContent(message.data.content as LessonContent);
                setStatus(null);
              }
            }
            if (message.event === "error") {
              throw new Error(
                typeof message.data.message === "string" ? message.data.message : "Content generation failed.",
              );
            }
          }
        }
      } catch (loadError) {
        if (!active) return;
        setError(loadError instanceof Error ? loadError.message : "Something went wrong.");
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, [content, courseId, subsectionId]);

  useEffect(() => {
    const handleScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      if (max <= 0) return;
      const percent = Math.min(100, Math.max(0, (window.scrollY / max) * 100));
      setScrollPercent(percent);
      setScrollPosition(courseId, subsectionId, percent);
      if (percent > 98 && !isComplete) {
        void markComplete(true);
      }
    };

    const frame = () => requestAnimationFrame(handleScroll);
    window.addEventListener("scroll", frame, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", frame);
  }, [courseId, isComplete, markComplete, subsectionId]);

  useEffect(() => {
    const local = readLocalProgress(courseId);
    const y = local.scrollPositions[subsectionId];
    if (typeof y === "number" && y > 2) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo({ top: (y / 100) * Math.max(max, 0) });
    }
  }, [content, courseId, subsectionId]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight" || event.key.toLowerCase() === "j") {
        if (nextHref) router.push(nextHref);
      }
      if (event.key === "ArrowLeft" || event.key.toLowerCase() === "k") {
        if (previousHref) router.push(previousHref);
      }
      if (event.key === "Escape") {
        router.push(`/course/${courseId}`);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [courseId, nextHref, previousHref, router]);

  useEffect(() => {
    for (const id of prefetchSubsectionIds) {
      void fetch(`/api/courses/${courseId}/content`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subsectionId: id }),
      }).catch(() => null);
    }
  }, [courseId, prefetchSubsectionIds]);

  const shortcutHint = useMemo(() => "Shortcuts: ←/→ or K/J · Esc for overview", []);

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-50 h-[3px] bg-white/10">
        <div className="h-full bg-amber-400 transition-[width] duration-150" style={{ width: `${scrollPercent}%` }} />
      </div>
      <main className="mx-auto min-h-screen max-w-3xl px-5 pb-16 pt-12 sm:px-7">
        <header className="mb-8 border-b border-white/10 pb-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <Link href={`/course/${courseId}`} className="text-xs uppercase tracking-[0.15em] text-stone-400 hover:text-stone-200">
              ← Back to overview
            </Link>
            <span className="text-xs text-stone-500">{shortcutHint}</span>
          </div>
          <p className="text-xs uppercase tracking-[0.16em] text-stone-500">
            Chapter {chapterOrder} · Section {chapterOrder}.{subsectionOrder}
          </p>
          <h1 className="mt-2 font-[var(--font-heading)] text-4xl text-stone-100">{subsectionTitle}</h1>
          <p className="mt-1 text-sm text-stone-400">{chapterTitle}</p>
        </header>

        {error && <p className="rounded-lg border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</p>}

        {!content && !error && (
          <section className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <div className="mb-3 flex items-center gap-2 text-stone-300">
              <Loader2 size={16} className="animate-spin" />
              <span>{status ?? "Generating..."}</span>
            </div>
            <div className="space-y-3">
              {new Array(5).fill(0).map((_, index) => (
                <div key={index} className="h-4 animate-pulse rounded bg-white/10" />
              ))}
            </div>
          </section>
        )}

        {content && <ContentRenderer blocks={content.blocks} />}

        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-6">
          <button
            type="button"
            onClick={() => void markComplete(!isComplete)}
            className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-3 py-2 text-sm text-stone-200 hover:border-amber-300/50"
          >
            <CheckCircle2 size={15} className={isComplete ? "text-emerald-300" : "text-stone-400"} />
            {isComplete ? "Completed" : "Mark as complete"}
          </button>

          <div className="flex items-center gap-2">
            {previousHref && (
              <Link
                href={previousHref}
                className="inline-flex items-center gap-1 rounded-lg border border-white/20 px-3 py-2 text-sm text-stone-200 hover:border-amber-300/50"
              >
                <ArrowLeft size={14} /> Previous
              </Link>
            )}
            <Link
              href={`/course/${courseId}`}
              className="inline-flex items-center gap-1 rounded-lg border border-white/20 px-3 py-2 text-sm text-stone-200 hover:border-amber-300/50"
            >
              <BookOpen size={14} /> Overview
            </Link>
            {nextHref && (
              <Link
                href={nextHref}
                className="inline-flex items-center gap-1 rounded-lg bg-amber-400 px-3 py-2 text-sm font-semibold text-neutral-900 hover:bg-amber-300"
              >
                Next <ArrowRight size={14} />
              </Link>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
