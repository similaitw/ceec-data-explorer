export function SiteFooter() {
  return <footer className="site-footer">
    <div className="footer-inner">
      <div>
        <strong>大考資料洞察 CEEC Data Explorer</strong>
        <p>本網站為非官方資料整理與視覺化專案。原始統計資料來源為大學入學考試中心；實際定義與數值請以官方公告為準。群體統計定位不代表校系錄取結果。</p>
      </div>
      <div className="footer-links">
        <a href="/methodology">方法與限制</a>
        <a href="/downloads">下載資料</a>
        <a href="/quality">品質報告</a>
        <a href="https://www.ceec.edu.tw/xmdoc?xsmsid=0J018604485538810196" target="_blank" rel="noreferrer">大考中心原始資料 ↗</a>
      </div>
    </div>
  </footer>;
}
