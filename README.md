# My Day Dashboard v5 — iPad / GitHub Pages

**專為 iPad Safari 橫向的香港生活 Widgets Dashboard，無須自架 Worker、Python Server 或長期開機的電腦。**

## 功能與資料來源

| 內容 | 資料來源 | 更新與限制 |
|---|---|---|
| 香港日期／時間 | iPad 本機時鐘，Asia/Hong_Kong | 每秒；裝置時間需正確 |
| 即時天氣、濕度、9 天預報、警告 | 香港天文台公開 JSON API | 瀏覽器直連，依天文台發布頻率更新 |
| 日照與潮汐 | 香港天文台公開天文資料 | 天文潮汐為**預測**，不是實測值 |
| 九巴 272A 博研路站 ETA | `data.etabus.gov.hk` 九巴官方 API | 每 60 秒直連，會按站名驗證「博研路／Silicon Hill」；Safari 若受 CORS／網絡阻擋則顯示不可用 |
| 香港電台新聞 | 官方繁中 RSS → GitHub Actions → `data/news.json` | 每約 20 分鐘嘗試同步，排程可能延遲，並非秒級即時 |
| 恒生指數報價／走勢 | TradingView 官方嵌入 Mini Chart，符號 `HSI:HSI` | 報價可能延遲、圖表可被網絡／內容攔截器阻擋 |
| 提醒／計時／倒數／字體／深淺色 | iPad Safari 本機 localStorage | 提醒只存在當前裝置和網站網域；鎖屏時不保證響鈴 |

## A. 最推薦：完整 GitHub Pages 部署（新聞自動更新）

1. GitHub 新建 **公開** Repository，例如 `myday-ipad`，主分支名稱使用 `main`。
2. **解壓 ZIP，並上傳解壓後的檔案和資料夾**至 Repository 根目錄。請務必保留隱藏資料夾 `.github/workflows/`、`scripts/`、`data/`、`index.html`。不要只上傳 ZIP，亦不要把全部檔案放在多一層資料夾。
3. Repository → **Settings → Pages → Build and deployment → Source → GitHub Actions**（**不要選 `Deploy from a branch`**）。
4. Repository → **Actions** → `My Day v5 - 更新新聞並發佈 Pages` → **Run workflow** 手動執行一次；或由首次 push 觸發。
5. 待 Actions 顯示成功後，在 Settings → Pages 查找網站網址，通常是 `https://你的用戶名.github.io/myday-ipad/`。到 iPad Safari 開啟 → 分享 → 加入主畫面。

> **重要：一定要選 GitHub Actions 作為 Pages Source。** GitHub 官方指出，使用內建 `GITHUB_TOKEN` 推送的 commit 不會觸發 branch 模式重新部署。v5 的單一 workflow 會直接產生 `news.json` 並發佈網站，完全不需 Token 或手動 commit 新聞。

## B. 新聞如何自動更新

- 工作流程：`.github/workflows/pages.yml`
- RSS 轉 JSON：`scripts/fetch_news.py`（純 Python 標準函式庫，無需 pip）
- 資料：部署時新產生的 `data/news.json`；部署工作會只上傳 HTML 與 JSON 到 Pages，無須每次 commit 新聞檔
- 時間：UTC 每小時 07、27、47 分，即**每 20 分鐘排程嘗試**；GitHub Actions 可能延遲，公有 Repository 長期無活動時排程可能暫停（GitHub 文件列明 60 天）。
- RSS 當次抓取失敗：網頁會提示同步失敗，**不會顯示假新聞**。
- GitHub Pages 部署亦要時間，因此新聞不屬於真正即時串流。

## C. 九巴 ETA

- 272A 屬循環線，博研路站可能顯示為 **Silicon Hill**。
- 程式讀取官方 `route-stop` + `stop` 核實車站，成功後將站牌標識短暫緩存在 Safari，之後每分鐘查 ETA。切勿將「第 10 站」直接當成固定站 ID。
- 如出現 `九巴官方 API 暫時無法直連`，可在 Safari 網路工具確認對 `https://data.etabus.gov.hk` 的請求。某些網絡或官方 CORS 設定可能限制 JavaScript；本版本**不會使用不可靠的第三方公共跨域代理**。

## D. 恒指 Widget

- 使用 TradingView 官方 Mini Chart 嵌入式服務 `s3.tradingview.com`，代碼 `HSI:HSI`；同時提供「完整圖表」直達連結。
- v5 不再從 Yahoo Finance 隱藏接口抓取圖表，因此不會出現「報價取得、走勢來源不可用」那一種分拆問題；但 TradingView 本身若載入失敗，亦可能整張行情 Widget 無法顯示。
- 不能把第三方行情視為交易所授權秒級即時報價。

## E. 其他提示

- 頁面不是 Apple 官方 Widget，外觀模仿 iPadOS 圓角／玻璃卡片並支援動畫。
- iPad 改用另一個 GitHub 網址後，原先保存在 `localhost` 或其他 domain 的提醒不會自動搬遷。
- **若只把 `index.html` 上傳而不包含 `.github` 及 `scripts`，新聞不會自動更新。**
- 本機雙擊 `index.html` 可預覽介面，但 GitHub Actions 不會在本機執行，新聞 JSON 初次為空；完整功能請透過 GitHub Pages 使用。

## 檔案

```
index.html                       網站主頁（單一 HTML：含 CSS / JavaScript）
.nojekyll                        GitHub Pages 配置
.github/workflows/pages.yml      抓取 RSS 並直接部署 Pages
scripts/fetch_news.py           香港電台 RSS → JSON
 data/news.json                  初始空資料，Actions 會在部署時生成
README.md                        本說明
```

來源網址：
- 九巴官方開放數據：https://data.etabus.gov.hk/
- 香港電台官方 RSS：https://news.rthk.hk/rthk/ch/rss.htm
- TradingView HSI：https://www.tradingview.com/symbols/HSI-HSI/
- GitHub Pages 官方：https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

*My Day Dashboard v5 不是 Apple、香港天文台、九巴、香港電台或 TradingView 官方產品。*
