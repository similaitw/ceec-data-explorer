# 大考資料洞察 CEEC Data Explorer

已完成 111–115 學年度學測 MVP ETL 與互動網站。網站包含總覽、歷年趨勢、級分分布、成績定位、資料下載、方法與品質頁，使用真實 processed data 靜態產生。

## 快速開始

```powershell
python -m pip install -e ".[dev]"
python -m ceec_etl all
pytest
npm install
npm run dev
```

可用子命令：`discover`、`download`、`transform`、`validate`、`all`。原始檔只寫入 `data/raw`，整理後的 CSV/JSON、來源清冊與品質報告分別寫入 `data/processed`、`data/catalog`、`data/quality`。

## 網站指令

```powershell
npm run dev        # 同步資料並啟動本機開發站
npm run typecheck  # TypeScript 型別檢查
npm test           # 前端計算測試
npm run build      # 產生靜態網站至 out/
npm run data       # 重跑完整 ETL 並同步前端資料
```

Next.js App Router 使用 `output: export`，可把 `out/` 部署至任何靜態網站服務。`public/data` 是 build-time 產物，由 `scripts/sync-data.mjs` 從已驗證的 processed data 產生。

本專案為非官方資料整理與視覺化專案。原始統計資料來源為大學入學考試中心；實際定義與數值請以官方公告為準。
