# 引き継ぎメモ（現状と残タスク）

新しい会話で作業を再開するときは、まず `CLAUDE.md`（仕様・ルール）とこのファイル（進み具合・残タスク）を読む。
最終更新：2026-10-05（グリッド型の作品の登録の並べ方まで main にマージ済み）

## 1. 進め方の約束（ユーザーとの合意）

- **デザインは基本 Figma（またはユーザーが貼るスクショ・CSS）に合わせる**。実装上の問題がありそうなとき、判断できない・予測で作った部分があるときは、勝手に決めずに報告の最後に一覧で知らせる
- 実装したら `npm run build` → Playwright（`/opt/pw-browsers/chromium`）で 375×812 のスクショを撮り、位置・大きさを計測して Figma／スクショと比べてから出す
- 作業ブランチ：`claude/cool-hopper-1fyf9f`。毎回 `origin/main` から切り直して作業 → PR → マージ
- **前の会話では「マージちょっと待って」と言われるまで、確認なしで PR 作成・マージしてよい**という合意だった。新しい会話では引き継がれないので、最初にユーザーに確認する
- 作業のたびに `docs/HANDOFF.md`（と必要なら `CLAUDE.md`）も更新して同じ PR に入れる（ユーザーの希望）
- 返答は日本語。専門用語は避け、結論 → 変えたこと → 決めたこと／確認したいこと の順で短く
- 確認ダイアログはまだブラウザ標準（`window.confirm` / `alert`）でよいと言われている（デザインは後日）

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
| ステップバー（終わったステップをタップで戻る） | 済 | `components/Stepbar` |
| 出力画像の描画（canvas、1080×1440） | 済 | `render/`（`layout.ts`・`colors.ts`・`renderRecap.ts`・`text.ts`） |
| 入力内容の保存（localStorage、書影は別キー） | 済 | `state/usePersistentState.ts`、`state/covers.ts` |

## 4. まだ手を付けていないもの・残タスク

優先度はユーザー未確認。上から順にやりそうなもの。

1. **確認・エラーのダイアログのデザイン**（ユーザーがデザイン予定）
   - 今はブラウザ標準。差し替える場所は 3 か所
     - リセットの確認：`screens/Edit/EditScreen.tsx` の `reset`
     - テンプレート変更で本・感想が消えるときの確認：`screens/Edit/EditScreen.tsx`（`planTemplateChange` の `warnings` を表示）
     - 書影の画像を読み込めないとき：`components/BookEditDialog/BookEditDialog.tsx` の `alert`
   - 中央ポップアップの土台は `components/Dialog`（入力モーダルで使用中）がそのまま使える
2. **書誌情報・書影の自動入力**（ネット検索・ISBN）
   - 入力モーダルに入口を足す想定。CORS で読める取得元を使うこと（読めない画像を canvas に描くと書き出しが失敗する）。候補の取得元は未調査
3. **X の投稿文**：今はテーマだけ。ハッシュタグやアプリ URL を入れるかは未定（ユーザーは「今はこのまま」）
4. **実機確認**：スマホの共有シート（端末に保存・X で共有）、長押しの並べ替え、カルーセルの手触り
5. **その他の小さな未決事項**
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
  features/TemplateSettingsFlow.tsx  テンプレート設定の 2 ステップ（最初の流れ／テンプレート変更）
  screens/                    各画面
  components/                 共通部品（Header・Stepbar・Button・Modal・Dialog・TextField など）
  hooks/                      FLIP アニメ、長押しの並べ替え
  styles/global.css           色・余白などのトークン
public/images, public/icons   Figma から書き出した画像（各 README に用途）
```
