"use client";

export function TimeDisplay({ date }: { date: string }) {
  return <>{new Date(date.replace(" ", "T") + "Z").toLocaleString()}</>;
}
