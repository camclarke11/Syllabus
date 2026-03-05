"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export function QuizBlock({ question, options, correctIndex, explanation }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const isCorrect = selected === correctIndex;

  return (
    <div className="my-6 rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <p className="mb-3 text-base font-semibold text-stone-100">{question}</p>
      <div className="space-y-2">
        {options.map((option, index) => {
          const chosen = selected === index;
          const stateColor =
            selected === null
              ? "border-white/10 hover:border-white/25"
              : chosen && index === correctIndex
                ? "border-emerald-400/60 bg-emerald-500/10"
                : chosen
                  ? "border-rose-400/60 bg-rose-500/10"
                  : "border-white/10 opacity-70";

          return (
            <button
              key={`${option}-${index}`}
              type="button"
              onClick={() => selected === null && setSelected(index)}
              className={cn(
                "w-full rounded-lg border px-3 py-2 text-left text-sm text-stone-200 transition",
                stateColor,
              )}
            >
              {option}
            </button>
          );
        })}
      </div>
      {selected !== null && (
        <div className="mt-3 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-stone-300">
          <p className={cn("mb-1 font-medium", isCorrect ? "text-emerald-300" : "text-rose-300")}>
            {isCorrect ? "Correct." : "Not quite."}
          </p>
          <p>{explanation}</p>
        </div>
      )}
    </div>
  );
}
