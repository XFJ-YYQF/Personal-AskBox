"use client";
import { useMemo } from "react";
import { marked, Renderer } from "marked";

const renderer = new Renderer();
renderer.link = function ({ href, title, tokens }) {
  const text = this.parser.parseInline(tokens);
  return `<a href="${href}" target="_blank" rel="noopener noreferrer"${title ? ` title="${title}"` : ""}>${text}</a>`;
};

marked.setOptions({
  renderer,
  breaks: true,
  gfm: true,
});

export function MarkdownContent({ text }: { text: string }) {
  const html = useMemo(() => marked.parse(text) as string, [text]);
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}
