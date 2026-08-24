import type { Metadata } from "next";
import { PageIntro } from "@/components/page-intro";

export const metadata: Metadata = { title: "方法與限制" };

export default function MethodologyPage() {
  return <div className="page">
    <PageIntro eyebrow="Method / Read before compare" title="方法與限制" description="資料不是只要畫成圖就能比較。這裡公開每一個重要定義、推導與不能跨越的界線。" note={<><strong>官方值 ≠ 本站衍生值</strong>所有衍生欄位均公開公式與版本。</>} />
    <article className="prose">
      <h2>資料如何來到畫面</h2>
      <div className="timeline"><div className="timeline-item"><h3>01 · 探索</h3><p>掃描大考中心學測統計清單與 111–115 年度頁，辨識五類附件。</p></div><div className="timeline-item"><h3>02 · 保存</h3><p>以低頻率下載原始 `.xls`，記錄 URL、原始檔名、時間與 SHA-256，不改寫 raw。</p></div><div className="timeline-item"><h3>03 · 解析與正規化</h3><p>依報名、缺考、分布、對照與五標分開解析；所有 processed 列保留 `source_id`。</p></div><div className="timeline-item"><h3>04 · 驗證</h3><p>檢查累計單調性、總計 reconciliation、級分區間重疊與五標順序。124 項檢核通過才供網站使用。</p></div></div>

      <h2>PR 區間怎麼算</h2><p>同一級分可能有數千人，無法合理給出單一名次。因此本站使用官方低至高累計百分比，扣除同級分百分比形成區間。</p><div className="formula">PR 下界 = 低至高累計百分比 − 同級分百分比<br />PR 上界 = 低至高累計百分比</div><p className="callout">例如某級分累計為 65.72%，該級分占 16.42%，則同分群體的位置約為 PR 49.30–65.72，而不是假裝知道每個人在同分群體內的次序。</p>

      <h2>五標不是考題難度</h2><p>頂標、前標、均標、後標、底標是當年度考生成績分布的位置指標。它同時受到考題、考生群體、計分方式與選考行為影響，不應單獨解讀為絕對難度，更不等於校系錄取門檻。</p>

      <h2>制度比較界線</h2><p>目前網站只納入 111–115 學年度學測，全部位於 111 新制：六考科、各科 15 級分。未來加入 110 以前資料時，趨勢圖必須在制度斷點分段，不會畫成無縫長線。</p><ul><li>不把舊制數學與數學 A／B 直接混算。</li><li>不把不同報考母群的比例當成同一母數。</li><li>不以各科邊際分布相乘虛構多科聯合分布。</li></ul>

      <h2>隱私與倫理</h2><p>成績定位完全在瀏覽器本機計算，不傳送或儲存輸入成績。本站不蒐集姓名、准考證號，也不由群體統計推估個人身分或錄取機率。</p>
    </article>
  </div>;
}

