"use client";

import { Clock, Mic, MicOff, Search, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import type { SearchFilters } from "@/lib/property-search";
import { type NlChip, parseNaturalLanguage } from "@/lib/nl-search";

// ── History persistence ───────────────────────────────────────────────────────

type HistoryEntry = { query: string; ts: number };
const HISTORY_KEY = "nestiq_search_history";
const MAX_HISTORY = 8;

function loadHistory(): HistoryEntry[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveHistory(query: string) {
  const next = [
    { query, ts: Date.now() },
    ...loadHistory().filter((h) => h.query !== query),
  ].slice(0, MAX_HISTORY);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
}

// ── Component ─────────────────────────────────────────────────────────────────

type Props = {
  chips: NlChip[];
  onChipsChange: (chips: NlChip[]) => void;
  onApplyFilters: (filters: Partial<SearchFilters>) => void;
  onDismissChip: (filterKey: string) => void;
};

export function SmartSearchBar({ chips, onChipsChange, onApplyFilters, onDismissChip }: Props) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [voiceActive, setVoiceActive] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    setVoiceSupported(!!(w.SpeechRecognition ?? w.webkitSpeechRecognition));
  }, []);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  function submit(q: string) {
    const trimmed = q.trim();
    if (!trimmed) return;

    saveHistory(trimmed);
    setHistory(loadHistory());
    setFocused(false);

    const result = parseNaturalLanguage(trimmed);
    onChipsChange(result.chips);
    onApplyFilters(result.filters);
  }

  function clearSearch() {
    setQuery("");
    onChipsChange([]);
    inputRef.current?.focus();
  }

  function startVoice() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    const SR = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!SR) return;

    if (voiceActive) {
      recognitionRef.current?.stop();
      setVoiceActive(false);
      return;
    }

    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = "en-IN";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (e: any) => {
      const transcript: string = e.results[0]?.[0]?.transcript ?? "";
      setQuery(transcript);
      setVoiceActive(false);
      submit(transcript);
    };
    rec.onerror = () => setVoiceActive(false);
    rec.onend = () => setVoiceActive(false);

    recognitionRef.current = rec;
    rec.start();
    setVoiceActive(true);
  }

  const showHistory = focused && !query && history.length > 0;

  return (
    <div className="border-b border-border bg-gradient-to-r from-emerald-50/80 to-teal-50/80 px-4 py-3 dark:from-emerald-950/20 dark:to-teal-950/20 sm:px-6">
      <div className="mx-auto max-w-3xl">
        {/* Label */}
        <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
          <Sparkles className="size-3.5" />
          Smart natural language search
        </p>

        {/* Input row */}
        <div className="flex items-center gap-2">
          {/* Input wrapper */}
          <div className="relative flex-1">
            <Sparkles className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-emerald-500" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit(query)}
              onFocus={() => setFocused(true)}
              onBlur={() => setTimeout(() => setFocused(false), 150)}
              placeholder="e.g. 3 BHK flat under 50 lakhs in Patna near schools with parking…"
              className="h-10 w-full rounded-lg border border-emerald-200 bg-white pl-9 pr-8 text-sm shadow-sm placeholder:text-muted-foreground/60 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200 dark:border-emerald-800 dark:bg-background dark:focus:border-emerald-600 dark:focus:ring-emerald-900"
            />
            {query && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Clear"
              >
                <X className="size-3.5" />
              </button>
            )}

            {/* History dropdown */}
            {showHistory && (
              <div className="absolute left-0 top-full z-50 mt-1 w-full rounded-lg border border-border bg-background shadow-lg">
                <p className="flex items-center gap-1.5 border-b border-border px-3 py-2 text-xs font-medium text-muted-foreground">
                  <Clock className="size-3" />
                  Recent searches
                </p>
                {history.map((h) => (
                  <button
                    key={h.ts}
                    type="button"
                    onMouseDown={() => {
                      setQuery(h.query);
                      submit(h.query);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent"
                  >
                    <Clock className="size-3.5 shrink-0 text-muted-foreground" />
                    <span className="truncate">{h.query}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Voice */}
          {voiceSupported && (
            <button
              type="button"
              onClick={startVoice}
              aria-label={voiceActive ? "Stop voice input" : "Voice search"}
              className={[
                "inline-flex size-10 shrink-0 items-center justify-center rounded-lg border transition-colors",
                voiceActive
                  ? "animate-pulse border-red-300 bg-red-50 text-red-500 dark:border-red-700 dark:bg-red-950/30"
                  : "border-input bg-background text-muted-foreground hover:border-emerald-300 hover:text-emerald-600",
              ].join(" ")}
            >
              {voiceActive ? <MicOff className="size-4" /> : <Mic className="size-4" />}
            </button>
          )}

          {/* Search */}
          <Button
            onClick={() => submit(query)}
            disabled={!query.trim()}
            size="sm"
            className="h-10 shrink-0 bg-emerald-600 px-4 text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            <Search className="size-4" />
            <span className="ml-1.5 hidden sm:inline">Search</span>
          </Button>
        </div>

        {/* Understood-as chips */}
        {chips.length > 0 && (
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-muted-foreground">Understood as:</span>
            {chips.map((chip) => (
              <span
                key={chip.filterKey}
                className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
              >
                {chip.label}
                <button
                  type="button"
                  onClick={() => onDismissChip(chip.filterKey)}
                  aria-label={`Remove ${chip.label}`}
                  className="ml-0.5 rounded-full text-emerald-600 hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-emerald-100"
                >
                  <X className="size-2.5" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
