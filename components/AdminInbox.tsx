"use client";

import { useEffect, useState } from "react";
import type { Question } from "@/lib/db";

const filterLabels: Record<string, string> = {
  pending: "待回答",
  answered: "已回答",
  published: "已展示",
  all: "全部问题",
};

export function AdminInbox() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [status, setStatus] = useState("pending");
  const [busy, setBusy] = useState(false);

  async function load(nextStatus = status) {
    setBusy(true);
    const response = await fetch(`/api/questions?status=${nextStatus}`, { cache: "no-store" });
    setBusy(false);
    if (response.ok) {
      const data = (await response.json()) as { questions: Question[] };
      setQuestions(data.questions);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function answer(id: string, form: HTMLFormElement) {
    const data = new FormData(form);
    const response = await fetch(`/api/questions/${id}/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        answer: data.get("answer"),
        publish: data.get("publish") === "on"
      })
    });
    if (response.ok) {
      form.reset();
      await load();
    }
  }

  return (
    <section className="admin-layout">
      <div className="row">
        <mdui-tabs value={status} full-width style={{width:"100%"}}>
          {(["pending","answered","published","all"] as const).map((item) => (
            <mdui-tab
              key={item}
              value={item}
              onClick={() => {
                setStatus(item);
                load(item);
              }}
            >
              {filterLabels[item]}
            </mdui-tab>
          ))}
        </mdui-tabs>
        {busy ? <mdui-circular-progress /> : null}
      </div>

      {questions.map((question) => (
        <article className="admin-card" key={question.id}>
      <div style={{display:"flex",alignItems:"center",gap:12}}>
            <strong>{question.nickname || "匿名"}</strong>
            <span className="muted">{new Date(question.created_at?.replace(" ", "T") + "Z").toLocaleString()}</span>
          </div>
          <p>{question.content}</p>
          {question.attachment_key ? <p><img src={`/api/questions/${question.id}/attachment`} alt="附件图片" style={{maxWidth:"100%",maxHeight:320,borderRadius:8,objectFit:"contain"}} /></p> : null}
          {question.answer ? <p className="muted">已答：{question.answer}</p> : null}
          <form
            className="form-stack"
            onSubmit={(event) => {
              event.preventDefault();
              answer(question.id, event.currentTarget);
            }}
          >
            <mdui-text-field name="answer" label="回答" rows="4" required />
            <mdui-checkbox name="publish" checked>发布到首页</mdui-checkbox>
            <mdui-button type="submit">保存回答</mdui-button>
          </form>
        </article>
      ))}

      {!questions.length && !busy ? <p className="muted">这里暂时没有问题。</p> : null}
    </section>
  );
}
