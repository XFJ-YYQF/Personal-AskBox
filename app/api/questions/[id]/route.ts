import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { deleteQuestion, getQuestion } from "@/lib/db";
import { deleteAttachment } from "@/lib/r2";
import { deleteQuestionFromIndex } from "@/lib/algolia-admin";

export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await context.params;
  const question = await getQuestion(id);
  if (!question) {
    return NextResponse.json({ error: "问题不存在。" }, { status: 404 });
  }
  await deleteAttachment(question.attachment_key);
  await deleteQuestion(id);
  await deleteQuestionFromIndex(id);
  return NextResponse.json({ ok: true });
}
