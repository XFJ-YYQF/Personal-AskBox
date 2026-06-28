"use client";
import { useEffect, useState, useCallback } from "react";
import { searchQuestions, type SearchResult } from "@/lib/algolia";
import { TimeDisplay } from "@/components/TimeDisplay";

export function SearchBar({ placeholder = "搜索问题…" }: { placeholder?: string }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    import("@mdui/icons/search.js");
  }, []);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setBusy(true);
    const { hits } = await searchQuestions(q);
    setResults(hits);
    setBusy(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => doSearch(query), 300);
    return () => clearTimeout(timer);
  }, [query, doSearch]);

  return (
    <div style={{position:"relative"}}>
      <mdui-text-field
        placeholder={placeholder}
        value={query}
        onInput={(e: any) => setQuery(e.target.value ?? "")}
        onFocus={() => setOpen(true)}
        clearable
      >
        <mdui-icon-search slot="icon"></mdui-icon-search>
      </mdui-text-field>
      {busy ? <mdui-circular-progress style={{position:"absolute",top:8,right:8}} /> : null}
      {open && results.length > 0 && (
        <div style={{
          position:"absolute",top:"100%",left:0,right:0,zIndex:10,
          background:"rgb(var(--mdui-color-surface-container-highest))",
          borderRadius:8,marginTop:4,maxHeight:360,overflowY:"auto",
          boxShadow:"var(--mdui-elevation-level2)"
        }}>
          {results.map((r) => (
            <div key={r.id} style={{padding:"12px 16px",borderBottom:"1px solid rgb(var(--mdui-color-outline-variant))",cursor:"pointer"}}>
              <p style={{margin:"0 0 4px",fontWeight:500}}>{r.content}</p>
              {r.answer ? <p style={{margin:"0 0 4px",fontSize:"0.875rem",color:"rgb(var(--mdui-color-on-surface-variant))"}}>{r.answer}</p> : null}
              <span style={{fontSize:"0.75rem",color:"rgb(var(--mdui-color-on-surface-variant))"}}>
                {r.nickname || "匿名"} · {r.published_at ? <TimeDisplay date={r.published_at} /> : ""}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
