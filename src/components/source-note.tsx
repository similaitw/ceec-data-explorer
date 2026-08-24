import type { SourceRecord } from "@/lib/types";

export function SourceNote({ source }: { source?: SourceRecord }) {
  if (!source) return null;
  return <div className="source-note">
    <strong>資料來源：</strong> {source.title} · {source.academic_year} 學年度 ·
    <a href={source.download_url} target="_blank" rel="noreferrer"> 原始 Excel ↗</a> ·
    下載日 {source.downloaded_at?.slice(0, 10)} · SHA-256 {source.sha256?.slice(0, 12)}…
  </div>;
}

