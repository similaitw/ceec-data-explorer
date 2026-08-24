# MVP 資料字典

所有 processed 列均含 `academic_year`、`exam=GSAT` 與 `source_id`，可回連 `data/catalog/sources.json`。

## fact_registration

每列為「年度 × 全體報名」或「年度 × 應試科目」。`registered_count`、`attended_count`、`absent_count` 為人數；`absence_rate` 為本站衍生的百分比。缺考表中的 `registered_count = attended_count + absent_count`，不是全體報名總數。

## fact_score_distribution

每列為「年度 × 科目 × 級分」。保留官方人數、百分比、自低分往高分累計與自高分往低分累計；百分比單位為 0–100。

## fact_score_boundary

每列為「年度 × 科目 × 級分」。`raw_score_lower/upper` 為原得總分邊界，並以 `lower_inclusive/upper_inclusive` 保存開閉區間；`source_interval_text` 保留官方原字串。

## fact_standard

每列為「年度 × 科目 × 五標」。`standard` 為頂標、前標、均標、後標或底標；`grade` 與 `cumulative_percentage` 皆為官方值。

## 缺失值

## fact_noncurrent_pathway

每列為「年度 × 非應屆統計」。`gsat_noncurrent_registered` 與 `gsat_noncurrent_share` 來自大考中心學測報名統計；`distribution_noncurrent_registered`、`distribution_noncurrent_admitted`、`distribution_noncurrent_admission_rate` 與 `distribution_noncurrent_admitted_share` 來自大學考試入學分發委員會。

- 「非應屆」是官方分類，不完全等同一般語意的重考生。
- 學測報名者與分發入學登記者是不同母群，不可視為同一批考生的漏斗。
- 分發錄取率只涵蓋分發入學，不是所有升學管道的總上榜率。

## 缺失值

- 空值代表該 grain 不適用，例如全體報名列沒有到考／缺考值。
- 官方 `--` 代表該年度科目制度不存在，不轉成 0，也不輸出成有效事實列。
- MVP 附件未遇到 `*` 或 `<5` 抑制值；未來 parser 必須另設缺失原因，禁止轉 0。
