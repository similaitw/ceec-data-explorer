import type { Metadata } from "next";
import "./globals.css";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: { default: "大考資料洞察｜CEEC Data Explorer", template: "%s｜大考資料洞察" },
  description: "將大考中心歷年公開統計資料轉為可查詢、可比較、可驗證、可下載的互動資料網站。",
  metadataBase: new URL("https://ceec-data-explorer.vercel.app"),
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-Hant-TW">
    <body>
      <a className="skip-link" href="#main">跳至主要內容</a>
      <SiteHeader />
      <main id="main">{children}</main>
      <SiteFooter />
    </body>
  </html>;
}
