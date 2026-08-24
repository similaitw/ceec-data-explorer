# MVP 資料字典

所有 processed 列均含 `academic_year` 與 `source_id`，可回連 `data/catalog/sources.json`。學測資料另含 `exam=GSAT`；分發入學資料不混用考試別欄位。

## fact_registration

每列為「年度 × 全體報名」或「年度 × 應試科目」。`registered_count`、`attended_count`、`absent_count` 為人數；`absence_rate` 為本站衍生的百分比。缺考表中的 `registered_count = attended_count + absent_count`，不是全體報名總數。

## fact_score_distribution

每列為「年度 × 科目 × 級分」。保留官方人數、百分比、自低分往高分累計與自高分往低分累計；百分比單位為 0–100。

## fact_score_boundary

每列為「年度 × 科目 × 級分」。`raw_score_lower/upper` 為原得總分邊界，並以 `lower_inclusive/upper_inclusive` 保存開閉區間；`source_interval_text` 保留官方原字串。

## fact_standard

每列為「年度 × 科目 × 五標」。`standard` 為頂標、前標、均標、後標或底標；`grade` 與 `cumulative_percentage` 皆為官方值。

## fact_noncurrent_pathway

每列為「年度 × 非應屆統計」。`gsat_noncurrent_registered` 與 `gsat_noncurrent_share` 來自大考中心學測報名統計；`distribution_noncurrent_registered`、`distribution_noncurrent_admitted`、`distribution_noncurrent_admission_rate` 與 `distribution_noncurrent_admitted_share` 來自大學考試入學分發委員會。

- 「非應屆」是官方分類，不完全等同一般語意的重考生。
- 學測報名者與分發入學登記者是不同母群，不可視為同一批考生的漏斗。
- 分發錄取率只涵蓋分發入學，不是所有升學管道的總上榜率。

## fact_university_admission

每列為「年度 × 大學」的分發入學校系錄取彙總，涵蓋 111–115 學年度。`program_count` 是該校出現在官方錄取表中的校系筆數，`admitted_count` 是錄取人數合計；`ownership` 與 `region` 取自教育部 114 學年度大專校院一覽表，其中 `region` 代表校本部所在地，不代表所有校區。

- 可依年度、國／私立、校本部地區與大學交叉篩選。
- 各校系採計科目與加權方式不同，本站不加總或平均最低錄取分數。
- 歷史校名以官方年度錄取表為準，學校屬性以教育部名錄與已知更名關係對照。

## fact_group_admission

每列為「年度 × 學群」的官方分發錄取彙總，目前提供 115 學年度 19 學群。`admitted_count` 是錄取人次，`capacity_usage_rate` 是官方招生名額使用率，百分比單位為 0–100。

- 部分校系跨屬兩個學群，學群人次合計可能高於總錄取人數。
- 官方公開表未提供逐校系的學群對照，因此學群統計不與大學、地區或國／私立篩選交叉，以避免自行猜測分類。

## 缺失值

- 空值代表該 grain 不適用，例如全體報名列沒有到考／缺考值。
- 官方 `--` 代表該年度科目制度不存在，不轉成 0，也不輸出成有效事實列。
- MVP 附件未遇到 `*` 或 `<5` 抑制值；未來 parser 必須另設缺失原因，禁止轉 0。
