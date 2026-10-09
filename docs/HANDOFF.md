# 引き継ぎメモ（現状と残タスク）

新しい会話で作業を再開するときは、まず `CLAUDE.md`（仕様・ルール）とこのファイル（進み具合・残タスク）を読む。
最終更新：2026-10-09（書名検索は楽天の ID 待ちで一時停止。再開の合図は 4 章の冒頭）

## 1. 進め方の約束（ユーザーとの合意）

- **デザインは基本 Figma（またはユーザーが貼るスクショ・CSS）に合わせる**。実装上の問題がありそうなとき、判断できない・予測で作った部分があるときは、勝手に決めずに報告の最後に一覧で知らせる
- 実装したら `npm run build` → Playwright（`/opt/pw-browsers/chromium`）で 375×812 のスクショを撮り、位置・大きさを計測して Figma／スクショと比べてから出す
- 作業ブランチ：`claude/cool-hopper-1fyf9f`。毎回 `origin/main` から切り直して作業 → PR → マージ
- **「マージちょっと待って」と言われるまで、確認なしで PR 作成・マージしてよい**という合意（2026-10-05 の新しい会話でも「マージは確認なしで OK」と言われた）。会話が変わったら念のため最初に確認する
- 作業のたびに `docs/HANDOFF.md`（と必要なら `CLAUDE.md`）も更新して同じ PR に入れる（ユーザーの希望）
- 返答は日本語。専門用語は避け、結論 → 変えたこと → 決めたこと／確認したいこと の順で短く

## 2. 環境まわりの注意

- 公開 URL：https://chocotto518.github.io/book-recap/ （`main` に入ると GitHub Actions で自動公開）
- クラウド環境のネットワーク許可に `www.figma.com` が入っている（Figma の画像アセットを curl で取得できる）
- **Figma MCP は Starter プランの呼び出し上限に一度達した**。読めないときは、ユーザーにスクショ（2x、750px 幅）や CSS を貼ってもらう。スクショから測るときは Pillow（`pip install pillow` 済みとは限らない）で座標を拾う
- Playwright で外部（Google Fonts）を読むときは `proxy: { server: process.env.HTTPS_PROXY, bypass: 'localhost,127.0.0.1' }` を付ける
- 描画を単体で確かめたいときは、ルートに一時的な HTML（`/src/render/renderRecap.ts` を import して `renderRecapCanvas` を呼ぶ）を置き `npx vite` で開く。コミットしない

## 3. できている画面・機能

| 画面 | 状態 | 主なファイル |
| --- | --- | --- |
| テンプレート設定：感想の有無 | 済 | `screens/CommentChoice/` |
| テンプレート設定：作品数の選択（タップで拡大／縮小の FLIP アニメ） | 済 | `screens/BookCount/`、`hooks/useFlip.ts` |
| 編集：投稿情報（テーマ・ユーザー名、説明図、どちらか入力で「進む」が活性） | 済 | `screens/Edit/PostInfoStep.tsx` |
| 編集：作品の登録（リスト型／グリッド型（冊数で 3 列・2 列を切り替え）、入力モーダル、書影の選択、長押しで並べ替え） | 済 | `screens/Edit/RegisterBooksStep.tsx`、`components/BookSlot`、`BookEditDialog`、`hooks/useLongPressReorder.ts` |
| 編集：カラー選択（横スライドのカルーセル、60% でスナップ、カラーボタン） | 済 | `screens/Edit/ColorStep.tsx`、`components/ColorCarousel` |
| 書き出し（PNG の保存・X で共有、保存後の「端末に保存しました」） | 済（実機の共有シートは未確認） | `screens/Edit/ExportStep.tsx`、`render/exportImage.ts`、`components/Toast` |
| ヘッダーのプレビュー（目のアイコン、中央ポップアップ） | 済 | `screens/Edit/PreviewContent.tsx` |
| ヘッダーの 3 点リーダーのメニュー（テンプレート変更・リセット） | 済 | `components/Header`、`components/EditMenu` |
| テンプレート変更（右からスライドイン、現在の設定、選択状態） | 済 | `features/TemplateSettingsFlow.tsx`（`change`） |
| 確認・お知らせのモーダル（リセット＝キャラクター付き、テンプレート変更で消える内容の確認、画像を読み込めないお知らせ） | 済 | `components/ConfirmDialog`、`components/LottiePlayer`、`assets/lottie/reset-character.json` |
| ステップバー（終わったステップをタップで戻る） | 済 | `components/Stepbar` |
| 出力画像の描画（canvas、1080×1440） | 済 | `render/`（`layout.ts`・`colors.ts`・`renderRecap.ts`・`text.ts`） |
| 入力内容の保存（localStorage、書影は別キー） | 済 | `state/usePersistentState.ts`、`state/covers.ts` |

## 4. まだ手を付けていないもの・残タスク

> **再開の合図**：ユーザーが「楽天書名検索の準備を進めたい」と言ったら、下の「1. 書誌情報・書影の自動入力」の時点（2026-10-09）から再開する。
> その時点の状況：
> - 楽天デベロッパーのアプリ ID は**まだ未登録**（再開時にユーザーが登録する）。登録画面の入れ方は案内済み：アプリ名 `book-recap`（あとで変えてよい）、URL `https://chocotto518.github.io/book-recap/`、種類「ウェブアプリケーション」、Allowed websites は `chocotto518.github.io` の 1 行だけ。アクセスキーが出たら、ページ内に見える前提でよいかユーザーと確認してから使う
> - 決まっていること：書名・作者名で検索 → 候補 → タップでタイトル・作者を入れる（画面は仮デザインで実装済み、ID 待ち）。楽天の書影は規約上使わない
> - 未決：①候補一覧に楽天の商品ページへのリンクを付けるか ②openBD に書影がある本（版元ドットコムで承諾済み）だけ img.hanmoto.com の書影を自動で入れるか
> - **カメラの扱いもこのとき決める**。ユーザーの希望は「書影の自動取得より、撮りやすくする工夫を優先」：①「カメラで撮る」「写真から選ぶ」のボタンを分ける（`capture="environment"`）＋②撮ったあと／選んだあとに四角い枠で表紙だけ切り抜く画面（発展で 4 隅を合わせて斜めを補正）を提案済みで、ユーザーは好感触

優先度はユーザー未確認。上から順にやりそうなもの。

1. **書誌情報・書影の自動入力**（ネット検索・ISBN）
   - 調査結果（2026-10-06、この環境とユーザーの iPhone の両方で確認）
     - 書影：国会図書館・openBD は画像が出ない、楽天・Google は CORS の許可がなく描き込めない → **サーバーなしでは書影は自動で入れられない**。書影は端末から選ぶ（中継サーバーを置くなら別途相談）
     - openBD は ISBN だけで安定。ただしユーザーは「13 桁を入れるなら手で書いたほうが早い」→ ISBN 入力は作らない
     - 国会図書館サーチは常に 429（混雑）、Google Books はキーなしだと 1 日の上限に達していて使えない
   - 決まったこと：**書名・作者名で検索 → 候補の一覧 → タップでタイトル・作者を入力欄に入れる**。取得元は楽天ブックス API（`BooksTotal/Search`）
   - 実装済み（仮デザイン）：`components/BookSearch`、`lib/bookSearch.ts`。入力モーダルの書影の下・タイトルの上
     - **楽天のアプリ ID 待ち**（ユーザーが登録中）。届いたら `lib/bookSearch.ts` の `RAKUTEN_APP_ID` に入れる。未設定のあいだは検索欄を出さない
     - URL に `?searchMock` を付けると見本のデータで画面を確かめられる（「エラー」「混雑」で失敗の表示）
     - アプリ ID なしで楽天を呼ぶと「specify valid access token」（401）が返った。登録の仕組みが変わっている可能性があるので、ID が来たら最初に実際に呼んで確かめる。秘密にすべきキーを求められたらブラウザに置けないので相談する
     - 楽天の利用規約で「Supported by Rakuten Developers」の表示が必要 → 検索欄の下に小さく表示（アプリ ID 設定時だけ）
     - 確認用ページ `public/cors-check.html` は削除済み
   - **書影の自動取得の調査（2026-10-08）**
     - 楽天の書影：規約上 NG の見込み（API の情報は「楽天の商品を紹介し商品ページにリンクする」目的以外の複製・改変は禁止、不特定多数が見られる場所への保存も禁止。書き出し画像に合成して X に投稿する使い方は当たりうる）。楽天の書影は使わない。書名・作者の検索も同じ条文がかかりうるので、候補一覧に楽天の商品ページへのリンクを付ける案をユーザーに提案済み
     - 版元ドットコム：規約（2024-03-15「読者など（第三者）への提供承諾についての規約」）では、承諾社の本は申請不要で、第三者への閲覧・書影のサイズ変更も可、本の紹介目的なら OK
       - 書影 `https://www.hanmoto.com/bd/img/{ISBN}.jpg` → `img.hanmoto.com` に転送。CORS 許可あり（`Access-Control-Allow-Origin: *`）で描き込める。`{ISBN}_600.jpg` は 600px 幅。大手（新潮社・集英社・KADOKAWA・講談社など）の本も画像自体はある
       - ただし大手の本は「利用可否不明」で、規約上使えるのは「【利用可】」の本だけ（例：ポット出版・藤原書店は利用可）。利用可かどうかは本のページ（`/bd/isbn/{ISBN}`）にしか書かれておらず、そのページは CORS 不可でブラウザから読めない
       - openBD の `summary.cover` が空でない本は承諾済みと見なせるが、利用可でも空の本がある（藤原書店）。openBD の書影 `cover.openbd.jp` 自体は CORS 不可なので、画像は img.hanmoto.com から取る
       - 版元ドットコムの旧 API（書名検索）は 2019 年に停止済み（openBD へ移行）。書名検索には使えない
   - リスクがあることは作る前にユーザーに知らせる（ユーザーの希望）
   - 入力モーダルに入口を足す想定。CORS で読める取得元を使うこと（読めない画像を canvas に描くと書き出しが失敗する）。候補の取得元は未調査
2. **X の投稿文**：今はテーマだけ。ハッシュタグやアプリ URL を入れるかは未定（ユーザーは「今はこのまま」）
3. **実機確認**：スマホの共有シート（端末に保存・X で共有）、長押しの並べ替え、カルーセルの手触り
4. **その他の小さな未決事項**
   - 未登録の本がある状態での書き出しの扱い（今は空白で書き出す。ユーザー了承済み）
   - キーボードでの並べ替えは未対応
   - localStorage の容量上限（数 MB）を超えた書影は、開いている間だけ保持される

## 5. これまでに決まった主な仕様（CLAUDE.md にないもの・経緯）

- 画面フローから「デザイン選択」は外した（テンプレート設定 → 編集 → 書き出し）
- 未入力の本・テーマ・ユーザー名は、画面上のプレビューでだけ見本の文字（`render/renderRecap.ts` の `SAMPLE`）で表示。書き出しには入れない
- 入力途中の本（何か 1 つでも入力済み）は、見本ではなく空欄のまま表示
- テンプレートを感想なしに変えると感想は本当に削除する（感想ありに戻しても戻らない）
- 折り返しは `Intl.Segmenter` で単語単位（Figma の見本と改行位置が違うことがあるが、ユーザー了承済み）
- テーマ・ユーザー名に付く罫線は 2px（`render/layout.ts` の `RULE_WIDTH`）
- カラーの「デフォルト」は黒（#000）。カラー別の背景色・アクセント色は `render/colors.ts`
- 押せないボタン：塗りはグレー #999、枠線は半透明
- タップ領域は最低 44px（見た目は Figma のまま、押せる範囲だけ広げる）
- サイズ M のボタン（保存する／キャンセル、はい／いいえなど）は高さ 44px ちょうど（枠線ぶん 45px になっていたのを直した）
- Lottie は `lottie-web` の軽量版（`lottie_light`、SVG 描画）。モーダルを開いたときに初めて読み込む（約 50KB）。ループ再生、動きを減らす設定の端末では止めて表示
- リセットのキャラクターの外枠（黒 1px）は JSON に入っているもの。デザインの見た目に合わせてそのまま使っている
- `ConfirmDialog`：`character` でキャラクターを出す（リセットだけ）。`onCancel` を省くとボタン 1 つのお知らせ（画像エラーの「閉じる」）。本文は `\n` で改行、長い行は `word-break: auto-phrase` で文節の切れ目で折り返す
- テンプレート変更の確認文は、消える内容を 1 行ずつ並べて最後に「変更しますか？」（`state/project.ts` の `planTemplateChange`）
  - `N冊目以降の本は削除されます。`／`登録した感想は削除されます。`／両方のときは `N冊目以降の本と登録した感想は削除されます。`（1 行にまとめる）／`感想のN字を超えた部分は削除されます。`。冊数などの（）は付けない（ユーザーの希望）
- テンプレート変更の作品数の選択で、カードの拡大後の下のボタンは「編集に戻る」（ユーザーの希望で「作品数の選択に戻る」から変更）。拡大を戻すのはヘッダーの「＜」
- 書影が未設定の枠は `public/images/cover-placeholder.svg`（グレーに顔、ユーザー支給）。以前の格子柄から変更。テンプレート見本の PNG（`count-*`・`template-*`）も、格子柄の位置にこの SVG を描き込んで差し替えた（文字などは Figma の書き出しのまま）。SVG を差し替えたときは、格子柄のままの元画像（コミット `6ed7af4` の `public/images/*.png`）に描き込み直す。枠の位置は `render/layout.ts` の書影の位置と同じ（`template-grid.png` だけ y が 16px 上）
- 保存後のお知らせ（`components/Toast`）は**仮デザイン**（ユーザー支給のスクショ：214×151、背景 #F9F9F9、黒 1px の枠、丸にチェックのアイコン、18px の文字）。本デザインが来たら差し替える
  - 1.8 秒表示してフェードアウト。背景は暗くせず、下の操作も邪魔しない
  - スマホは共有シートで「完了」したとき（キャンセル以外）に出す。共有シートでは「画像を保存」以外（LINE など）を選んでも出てしまう（どれを選んだかはブラウザから分からない）
  - 「Xで共有」のときは出さない
- モーダルが重なったとき（テンプレート変更の上の確認、入力モーダルの上の画像エラー）、Esc は一番上だけを閉じる（`components/overlayStack.ts`）

## 6. コードの地図

```
src/
  App.tsx                     画面の切り替え（templateSettings / edit）とプロジェクトの保存・リセット
  constants/flow.ts           画面名・ステップ名
  constants/template.ts       冊数・感想の上限文字数
  state/project.ts            Project・Book の型、fitBooks、planTemplateChange
  state/covers.ts             書影の保存・読み込み・縮小
  state/usePersistentState.ts localStorage つき useState
  render/                     出力画像の描画（プレビューと書き出しで共通）
  assets/lottie/              Lottie アニメーションの JSON
  features/TemplateSettingsFlow.tsx  テンプレート設定の 2 ステップ（最初の流れ／テンプレート変更）
  screens/                    各画面
  components/                 共通部品（Header・Stepbar・Button・Modal・Dialog・TextField など）
  hooks/                      FLIP アニメ、長押しの並べ替え
  styles/global.css           色・余白などのトークン
public/images, public/icons   Figma から書き出した画像（各 README に用途）
```
