"use client";
import { useEffect, useState, useCallback } from "react";
import { searchQuestions, type SearchResult } from "@/lib/algolia";

export function AdminSearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
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
    <div>
      <mdui-text-field
        placeholder="搜索问题…"
        value={query}
        onInput={(e: any) => setQuery(e.target.value ?? "")}
        clearable
        style={{width:"100%"}}
      >
        <mdui-icon-search slot="icon"></mdui-icon-search>
      </mdui-text-field>
      {busy ? <mdui-circular-progress /> : null}
      {results.length > 0 && (
        <div style={{marginTop:8,display:"grid",gap:8}}>
          {results.map((r) => (
            <div key={r.id} style={{padding:"12px 16px",borderRadius:8,background:"rgb(var(--mdui-color-surface-container-high))"}}>
              <p style={{margin:"0 0 4px",fontWeight:500}}>{r.content}</p>
              {r.answer ? <p style={{margin:"0 0 4px",fontSize:"0.875rem"}}>{r.answer}</p> : null}
              <span style={{fontSize:"0.75rem",color:"rgb(var(--mdui-color-on-surface-variant))"}}>
                {r.nickname || "匿名"} · {r.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
