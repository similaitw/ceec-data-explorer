const links = [
  ["總覽", "/"], ["歷年趨勢", "/trends"], ["級分分布", "/distribution"],
  ["成績定位", "/position"], ["資料下載", "/downloads"], ["方法", "/methodology"],
] as const;

export function SiteHeader() {
  return <header className="site-header">
    <div className="header-inner">
      <a href="/" className="brand" aria-label="大考資料洞察首頁">
        <span className="brand-mark">考</span>
        <span>大考資料洞察<small>CEEC Data Explorer</small></span>
      </a>
      <nav className="nav" aria-label="主要導覽">
        {links.map(([label, href]) => <a key={href} href={href}>{label}</a>)}
        <a className="quality-link" href="/quality">資料品質</a>
      </nav>
      <details className="mobile-nav">
        <summary>選單</summary>
        <nav aria-label="行動版導覽">{links.map(([label, href]) => <a key={href} href={href}>{label}</a>)}<a href="/quality">資料品質</a></nav>
      </details>
    </div>
  </header>;
}
