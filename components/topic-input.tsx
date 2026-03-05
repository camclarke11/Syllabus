"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

const EXAMPLES = [
  "Quantum Computing",
  "French Cooking",
  "TypeScript",
  "Music Theory",
  "Stoic Philosophy",
  "Machine Learning",
  "Screenwriting",
  "UK Data Protection Law",
];

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
      // Ignore malformed chunks and keep consuming the stream.
    }
  }

  return { messages, rest };
}

export function TopicInput() {
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [outline, setOutline] = useState<string[]>([]);
  const [statusText, setStatusText] = useState("Preparing curriculum designer…");

  const isDisabled = useMemo(() => isGenerating || topic.trim().length === 0, [isGenerating, topic]);

  async function generateCourse(nextTopic?: string) {
    const value = (nextTopic ?? topic).trim();
    if (!value) return;
    setIsGenerating(true);
    setError(null);
    setOutline([]);
    setStatusText("Designing your syllabus…");

    try {
      const response = await fetch("/api/courses/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: value, experienceLevel: "beginner" }),
      });

      if (!response.ok || !response.body) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? "Failed to generate course.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value: chunk } = await reader.read();
        if (done) break;

        buffer += decoder.decode(chunk, { stream: true });
        const parsed = parseSseChunk(buffer);
        buffer = parsed.rest;

        for (const message of parsed.messages) {
          if (message.event === "status" && typeof message.data.message === "string") {
            setStatusText(message.data.message);
          }
          if (message.event === "outline" && Array.isArray(message.data.chapters)) {
            setOutline(message.data.chapters.filter((item): item is string => typeof item === "string"));
          }
          if (message.event === "done" && typeof message.data.courseId === "string") {
            router.push(`/course/${message.data.courseId}`);
            return;
          }
          if (message.event === "error") {
            throw new Error(
              typeof message.data.message === "string"
                ? message.data.message
                : "Generation failed. Try rephrasing your topic.",
            );
          }
        }
      }
    } catch (streamError) {
      setError(streamError instanceof Error ? streamError.message : "Something went wrong.");
      setIsGenerating(false);
      return;
    }

    setIsGenerating(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await generateCourse();
  }

  return (
    <div className="w-full max-w-3xl">
      <p className="mb-4 text-center text-sm uppercase tracking-[0.18em] text-amber-300/80">
        AI-generated courses on anything
      </p>
      <h1 className="mb-8 text-center font-[var(--font-heading)] text-4xl leading-tight text-stone-100 sm:text-5xl">
        What do you want to learn?
      </h1>

      <form
        onSubmit={handleSubmit}
        className="mx-auto mb-5 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur"
      >
        <input
          className="h-12 w-full rounded-xl border border-transparent bg-transparent px-4 text-lg text-stone-100 placeholder:text-stone-400 outline-none focus:border-amber-300/50"
          autoFocus
          placeholder="Type any topic..."
          value={topic}
          onChange={(event) => setTopic(event.target.value)}
          disabled={isGenerating}
        />
        <button
          type="submit"
          disabled={isDisabled}
          className="inline-flex h-12 items-center gap-2 rounded-xl bg-amber-400 px-5 text-sm font-semibold text-neutral-900 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Generate
          <ArrowRight size={16} />
        </button>
      </form>

      <div className="mb-8 flex flex-wrap justify-center gap-2">
        {EXAMPLES.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => {
              setTopic(example);
              void generateCourse(example);
            }}
            disabled={isGenerating}
            className="rounded-full border border-white/10 px-3 py-1.5 text-sm text-stone-300 transition hover:border-amber-300/50 hover:text-stone-100 disabled:opacity-50"
          >
            {example}
          </button>
        ))}
      </div>

      {isGenerating && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="mb-4 flex items-center gap-2 text-amber-200">
            <Sparkles size={15} />
            <p className="text-sm">{statusText}</p>
          </div>
          <div className="space-y-2">
            {(outline.length > 0 ? outline : new Array(6).fill("Generating chapter…")).map((line, index) => (
              <div
                key={`${line}-${index}`}
                className="animate-pulse rounded-md border border-white/8 bg-white/4 px-3 py-2 text-sm text-stone-300"
              >
                {line}
              </div>
            ))}
          </div>
        </div>
      )}

      {error && <p className="mt-4 text-center text-sm text-rose-300">{error}</p>}
    </div>
  );
}
