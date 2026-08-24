import { Suspense } from "react";
import type { Metadata } from "next";
import { PageIntro } from "@/components/page-intro";
import { PositionCalculator } from "@/components/position-calculator";
import { getAllData } from "@/lib/data";

export const metadata: Metadata = { title: "個人成績定位" };

export default async function PositionPage() {
  const data = await getAllData();
  return <div className="page">
    <PageIntro eyebrow="Position / Not prediction" title="成績定位" description="把單科級分放回當年度分布，得到誠實的同分區間，而不是一個看似精確的假名次。" note={<><strong>本機瀏覽器運算</strong>不儲存成績，不推算錄取機率。</>} />
    <Suspense fallback={<div className="panel">正在準備定位資料…</div>}><PositionCalculator distributions={data.distributions} boundaries={data.boundaries} standards={data.standards} /></Suspense>
  </div>;
}

