"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Clipboard, Cloud, ExternalLink, History, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

type CapturedCode = {
  id: string;
  clientId: string;
  rawValue: string;
  normalizedUrl: string;
  host: string;
  source: string;
  capturedAt: string;
};

type HistoryResponse = {
  capturedCodes: CapturedCode[];
  pagination: { page: number; totalPages: number; totalCount: number };
};

export function HistoryClient() {
  const [entries, setEntries] = useState<CapturedCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { toast } = useToast();

  const loadPage = useCallback(async (nextPage: number, append = false) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/captured-codes?page=${nextPage}&limit=50`);
      if (!response.ok) throw new Error("Failed to load history");
      const data = (await response.json()) as HistoryResponse;
      setEntries((current) => append ? [...current, ...data.capturedCodes] : data.capturedCodes);
      setPage(data.pagination.page);
      setTotalPages(data.pagination.totalPages);
      setTotalCount(data.pagination.totalCount);
    } catch {
      toast({ title: "History unavailable", description: "We couldn't load your saved links.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void loadPage(1);
  }, [loadPage]);

  const copy = async (entry: CapturedCode) => {
    await navigator.clipboard.writeText(entry.rawValue);
    setCopiedId(entry.id);
    window.setTimeout(() => setCopiedId(null), 1_500);
  };

  const remove = async (entry: CapturedCode) => {
    const response = await fetch(`/api/captured-codes/${entry.id}`, { method: "DELETE" });
    if (!response.ok) {
      toast({ title: "Couldn't delete link", variant: "destructive" });
      return;
    }
    setEntries((current) => current.filter((item) => item.id !== entry.id));
    setTotalCount((count) => Math.max(0, count - 1));
  };

  const clear = async () => {
    if (!window.confirm("Clear every link in your cloud history? This can't be undone.")) return;
    setClearing(true);
    try {
      const response = await fetch("/api/captured-codes", { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to clear history");
      setEntries([]);
      setTotalCount(0);
      setPage(1);
      setTotalPages(1);
    } catch {
      toast({ title: "Couldn't clear history", variant: "destructive" });
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="min-h-screen p-8 lg:p-12">
      <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-primary">
            <Cloud className="h-3.5 w-3.5" /> Synced link library
          </div>
          <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">History</h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Links scanned or created with QR Code by teag.me, backed up to your account and available anywhere.
          </p>
        </div>
        <Button variant="outline" onClick={clear} disabled={entries.length === 0 || clearing}>
          <Trash2 className="mr-2 h-4 w-4" />
          {clearing ? "Clearing…" : "Clear history"}
        </Button>
      </div>

      <div className="mb-5 flex items-center justify-between border-b pb-3 text-sm text-muted-foreground">
        <span>{totalCount.toLocaleString()} saved {totalCount === 1 ? "link" : "links"}</span>
        <span className="font-mono text-[10px] uppercase tracking-wider">Private to your account</span>
      </div>

      {!loading && entries.length === 0 ? (
        <div className="flex min-h-[360px] flex-col items-center justify-center rounded-3xl border border-dashed bg-card/40 px-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
            <History className="h-7 w-7 text-primary" />
          </div>
          <h2 className="mt-5 text-xl font-semibold">Your link history is empty</h2>
          <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
            Sign in from the scanner and enable cloud history to make captured URLs available here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <article key={entry.id} className="group rounded-2xl border bg-card p-5 transition-colors hover:border-primary/25">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                  <ExternalLink className="h-5 w-5" />
                </div>
                <a href={entry.normalizedUrl} target="_blank" rel="noreferrer" className="min-w-0 flex-1">
                  <h2 className="truncate text-base font-semibold group-hover:text-primary">{entry.host}</h2>
                  <p className="mt-1 truncate font-mono text-[11px] text-muted-foreground">{entry.rawValue}</p>
                  <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground/70">
                    {new Date(entry.capturedAt).toLocaleString()} · {entry.source}
                  </p>
                </a>
                <div className="flex shrink-0 gap-2">
                  <Button variant="outline" size="sm" onClick={() => void copy(entry)}>
                    {copiedId === entry.id ? <Check className="mr-2 h-3.5 w-3.5" /> : <Clipboard className="mr-2 h-3.5 w-3.5" />}
                    {copiedId === entry.id ? "Copied" : "Copy"}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => void remove(entry)} aria-label={`Delete ${entry.host}`}>
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              </div>
            </article>
          ))}
          {page < totalPages && (
            <div className="pt-4 text-center">
              <Button variant="outline" onClick={() => void loadPage(page + 1, true)} disabled={loading}>
                {loading ? "Loading…" : "Load more"}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
