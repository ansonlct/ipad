## 最新 — My Day v5.32（2026-11-05 HKT）
本版保守審視 v5.31 程式，維持 **21 個 Widget** 及所有原有 CSS。改善本機資料容錯、港台新聞來源白名單、重複空白提示、時間 formatter，移除確定未使用的舊市場繪圖函式。使用 `MyDay_Project_Handoff_v5_32.txt` 作為最新交接，部署需更新 `index.html` 和 `scripts/fetch_news.py`。本機 Chromium 離線驗證 **851/851 PASS**，不代表 Safari 真機／Live API 驗證。

---

## Latest — My Day v5.31 (2026-11-05 HKT)

Photo Widget hover now shades only the inset cue like Reminders and Important Dates. The photo title uses an inline SVG picture icon instead of ▧. All 21 widgets preserved. `MyDay_Project_Handoff_v5_31.txt` is the latest. Local Chromium verification: 390/390 PASS.

---

## Latest — My Day v5.30 (2026-11-05 HKT)

**21 Widgets**. The empty states of My Reminders, Important Dates, and Photo now share the same typography, icon size, placement and darker-on-hover treatment. Prompts: 「記錄我的提醒／按空白位置新增」, 「記錄重要日子／按空白位置新增」, 「珍藏一刻／按空白位置新增」. Existing content and uploaded-photo behavior are unchanged. See `MyDay_Project_Handoff_v5_30.txt`, `INSTALL_STEPS_HK_v5_30.txt`, `TEST_REPORT_v5_30.txt`. Chromium local test **768/768 PASS**; no real iPad Safari or public site validation.

---

## Latest — My Day v5.29 (2026-11-05 HKT)

**21 Widgets**. When a picture has been uploaded, the photo Widget's upper-left heading and upper-right × control are hidden by default; both appear on mouse/trackpad hover and disappear on mouseout. On touch-only devices the first tap reveals controls; a second tap replaces the image. Keyboard users can Tab to the remove button. Empty-state invitation, square crop, one-image browser-local storage, and original Widgets are unchanged. Latest handoff `MyDay_Project_Handoff_v5_29.txt`; install `INSTALL_STEPS_HK_v5_29.txt`; mock test report `TEST_REPORT_v5_29.txt`. Chromium synthetic tests **257/257 PASS**; no actual iPad Safari or public deployment test.

---

## Latest — My Day v5.28 (2026-11-05 HKT)

**21 Widgets** including a single square 「圖片」 Widget. Click the empty card to select a picture; the image is center-cropped into a square, stored in this browser only, and can be replaced or removed. No external image upload. Current homepage is `index.html`; latest handoff `MyDay_Project_Handoff_v5_28.txt`, install `INSTALL_STEPS_HK_v5_28.txt`, tests `TEST_REPORT_v5_28.txt`. Chromium synthetic/mock tests **168/168 PASS**, not actual iPad Safari or public GitHub Pages test.

---

## Latest version — My Day v5.27 (2026-11-05 HKT)

The pressure semi-circular **visible tick ring**, not only its SVG bounding box, is now vertically centered within each square Widget; low/high labels rise with it. The readout and arrow remain separate, preventing collisions. No changes to v5.26 visibility or sun curve behavior. Read `MyDay_Project_Handoff_v5_27.txt` and `INSTALL_STEPS_HK_v5_27.txt`. Chromium mock 123/123 PASS; no real Safari/live API test.

---

## Latest version — My Day v5.26 (2026-11-05 HKT)

The active homepage is `index.html`. For the latest handoff, see `MyDay_Project_Handoff_v5_26.txt`. Pressure instrument spacing, a clean visibility reading, and a full 24-hour sunrise/sunset dot path were improved. Mock Chromium test: 102/102 PASS; iPad Safari and live APIs not yet verified.

---

# My Day v5.25 — 香港 Dashboard（iPad / Windows）

最新基準 v5.25（20 個 Widget）：改善氣壓置中、能見度視覺效果及日落後下降曲線。保留 v5.24 統一標題與 v5.23 統一來源 footer，保留原有分頁及個人化資料。部署方式不變：更新 GitHub Pages 根目錄 `index.html`。

先閱讀 `MyDay_Project_Handoff_v5_25.txt`、`INSTALL_STEPS_HK_v5_25.txt` 和 `TEST_REPORT_v5_25.txt`。模擬截圖不是即時數據。

---

# My Day v5.24 — 香港 Dashboard（iPad / Windows）

**最新版本 v5.24，20 個 Widget。** 本次按「相對濕度」統一所有 16 個有標題 Widget 的字體、大小、字重、透明度和左上角位置。保留 v5.23 統一來源 footer、九巴 `KMB · HH:mm`，以及 v5.22 四個天氣 Widget、右側分頁點與滑動動畫。

請先閱讀 `ONGOING_DEVELOPMENT_HANDOFF.txt`、`MyDay_Project_Handoff_v5_24.txt`、`TEST_REPORT_v5_24.txt`。`index.html` 是唯一最新入口，舊版檔案作歷史參考。

---

# My Day v5.23 — 香港 Dashboard（iPad / Windows）

**最新版本：v5.23，20 個 Widget。** 本次統一 11 個 Widget 左下角資料來源及更新時間（同「即時天氣」9px 字體和位置），九巴改 `KMB · HH:mm` 並移除右上角「最後更新」文字。頁面自動分頁與最右側圓點保持不變。

請先閱讀 `ONGOING_DEVELOPMENT_HANDOFF.txt`、`MyDay_Project_Handoff_v5_23.txt` 以及 `INSTALL_STEPS_HK.txt`。

---

# My Day v5.22 — 香港 Dashboard（iPad / Windows）

本版由 v5.21 完整專案延伸，保留 **20 個 Widget**、個人化 localStorage、GitHub Pages 靜態部署及新聞更新 workflow。

## v5.22 更新
- 參照三張介面圖片重設風向風速／氣壓／紫外線外觀。**風**：圓形羅盤、72 刻度、風來源點及流向箭頭、中文方位、風速／陣風；**氣壓**：53 刻度弧形儀表、動態白針、kPa 大字、升／降趨勢；**UV**：大字級別、彩色指數條及指標、防曬建議。以上配色適配 iOS 淡彩及暗色模式。
- **自動分頁圓點改放最右方垂直排列**，頁數多少就顯示多少點，當前頁高亮。僅多頁顯示；點圓點或上／下掃換頁，保留動畫及鍵盤／滑鼠操作，右側預留邊距以免遮卡片。
- 新增模型陣風風速與氣壓過去時段比較。資料失敗時不會冒用舊箭頭／指標。紫外線仍以 HKO 實測優先。

## 使用及交接
- `index.html` 可直接覆蓋 GitHub Pages 的根目錄首頁。
- `INSTALL_STEPS_HK.txt`：安裝／實機驗收／回滾。
- `ONGOING_DEVELOPMENT_HANDOFF.txt`、`MyDay_Project_Handoff_v5_22.txt`：完整版本交接，請後續開發先讀。
- `TEST_REPORT_v5_22.txt`、`tests/acceptance_v5_22.py`：Playwright Chromium mock API 驗收 38/38 PASS。
- `PREVIEW_*_MockData.png`：模擬資料版面圖，不是真實即時天氣。

---

## 舊版 v5.21 背景（歷史資訊）

# My Day v5.21 — 香港 Dashboard（iPad / Windows）

這是從 **v5.20** 原始專案直接延續的 GitHub Pages Dashboard，保留原來 16 個 Widget，現共有 **20 個 Widget**。網站本身不需要後端、不需要新的 JavaScript 函式庫。

## v5.21 的兩項更新

1. **自動分頁與動態編排**：依瀏覽器實際可用寬度／高度、Widget 數量和可讀尺寸，自動把全部 Widget 編排到一頁；放不下才新增下一頁。每頁完整落在視窗內，整頁不需要向下捲動。正方形 Widget 保留 1:1，未來天氣和新聞沿用較寬的形態。上下滑動切頁、頁首上下箭頭／頁數、滑鼠滾輪及 PageUp / PageDown 鍵均可操作。跨頁有動畫，亦尊重系統「減少動態效果」及原有動畫設定。提醒／重要日子／新聞卡片內的清單仍可獨立捲動。
2. **新增四個 Widget**：海平面氣壓（hPa）、能見度（km）、紫外線指數（UV）、風向及風速（km/h；16 方位）。四張卡片維持 iOS 風格，資料更新與既有重新整理／自動更新整合。

## 資料來源的差別（必須保留在未來版本）

- 既有即時氣溫與濕度仍以香港天文台 HKO 官方 API 為準，繼續支援測站選擇。
- **紫外線**優先使用 HKO `rhrread.uvindex` 觀測數值；HKO 未提供數值時才採用 Open-Meteo 模型預估，卡片來源會標示「HKO 實測」或「Open-Meteo · 模型」。
- **氣壓、能見度、風向及風速**使用 Open-Meteo 免費 Forecast API 針對所選香港地區位置輸出的 **天氣模型估算值，不是當地即時儀器實測**。API 不需要 token。若所選 HKO 測站尚未在地區座標表中列明，便使用香港區域座標並標示「香港區域」。
- 任一 API 連線失敗／資料不合理時顯示 `--` 和「暫不可用」，不得填入示意值偽裝最新觀測。
- 官方 HKO：https://www.hko.gov.hk/ ；Open-Meteo 文件：https://open-meteo.com/en/docs

## 安裝與交接文件

- `index.html`：完整網站，直接覆蓋 GitHub Pages Repo 根目錄同名檔案。
- `INSTALL_STEPS_HK.txt`：繁體中文安裝、測試及回滾。
- `ONGOING_DEVELOPMENT_HANDOFF.txt`：往後對話使用的最新交接文件。
- `MyDay_Project_Handoff_v5_21.txt`：v5.21 技術交接與繼續開發要點。
- `MyDay_Project_Handoff_v5_20.txt`：上一版歷史基準，僅供追溯。
- `TEST_REPORT_v5_21.txt`：實際測試結果及未測項目。
- `PREVIEW_*_MockData.png`：截圖中使用 **API 模擬測試數據，並非即時天氣**。
- `.github/workflows/pages.yml`、`scripts/fetch_news.py`、`data/news.json`：沿用原本 GitHub Pages、RSS 更新流程；沒有改動。

**本機資料：** 無清除或轉換 `myday.settings`、提醒、重要日子、月曆標記或網站捷徑的 localStorage；不同裝置不會因此自動同步。

**部署：** GitHub Pages 在網絡可用時會直接向官方來源／Open-Meteo 查詢。外部 API 的 CORS、網絡及第三方服務能力應在實際 iPad Safari／Windows 瀏覽器再次驗收；本次不能聲稱已完成實機驗收。

### 可重現自動化檢查（可選，網站部署不需要）

如電腦裝有 Python、Playwright 與 Chromium，可在專案目錄執行 `python tests/acceptance_v5_21.py`。測試使用 mock API，不需真的連到天文台或 Open-Meteo；執行後在 `tests/acceptance_results.txt` 產生 PASS／FAIL 記錄及刷新預覽圖片。這是開發驗收工具，不是網站 runtime 依賴。
