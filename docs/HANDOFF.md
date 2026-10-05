# 引き継ぎメモ（現状と残タスク）

新しい会話で作業を再開するときは、まず `CLAUDE.md`（仕様・ルール）とこのファイル（進み具合・残タスク）を読む。
最終更新：2026-10-05（確認・お知らせのモーダル 3 種（リセット・テンプレート変更・画像エラー）まで main にマージ済み）

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
| 書き出し（PNG の保存・X で共有） | 済（実機の共有シートは未確認） | `screens/Edit/ExportStep.tsx`、`render/exportImage.ts` |
| ヘッダーのプレビュー（目のアイコン、中央ポップアップ） | 済 | `screens/Edit/PreviewContent.tsx` |
| ヘッダーの 3 点リーダーのメニュー（テンプレート変更・リセット） | 済 | `components/Header`、`components/EditMenu` |
| テンプレート変更（右からスライドイン、現在の設定、選択状態） | 済 | `features/TemplateSettingsFlow.tsx`（`change`） |
| 確認・お知らせのモーダル（リセット＝キャラクター付き、テンプレート変更で消える内容の確認、画像を読み込めないお知らせ） | 済 | `components/ConfirmDialog`、`components/LottiePlayer`、`assets/lottie/reset-character.json` |
| ステップバー（終わったステップをタップで戻る） | 済 | `components/Stepbar` |
| 出力画像の描画（canvas、1080×1440） | 済 | `render/`（`layout.ts`・`colors.ts`・`renderRecap.ts`・`text.ts`） |
| 入力内容の保存（localStorage、書影は別キー） | 済 | `state/usePersistentState.ts`、`state/covers.ts` |

## 4. まだ手を付けていないもの・残タスク

優先度はユーザー未確認。上から順にやりそうなもの。

1. **書誌情報・書影の自動入力**（ネット検索・ISBN）
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
  - `N冊目以降の本（n冊）は削除されます。`／`登録した感想（n冊分）は削除されます。`／`感想のN字を超えた部分（n冊分）は削除されます。`
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
