# book-recap

自分なりのテーマで、人に紹介したい本を 1 枚の画像にまとめるウェブアプリ。
本を登録（手入力または自動）して、1080×1440 の PNG として端末に保存・X で共有する。

## 開発

```sh
npm install
npm run dev
```

## 画面フロー

テンプレート設定（感想の有無 → 作品数）→ 編集（投稿情報 → 本の登録 → カラー選択）→ 書き出し（保存・X 共有）

編集画面のヘッダーから、テンプレート変更とプレビューをモーダルで開ける。

## 構成

- Vite + React + TypeScript、スタイルは CSS Modules
- デザイントークン: `src/styles/global.css`
- 共通コンポーネント: `src/components`（Header / Stepbar / TemplateOptionCard）
- 画面: `src/screens`

## ブラウザで確認（Node.js 不要）

`main` に push されると GitHub Actions がビルドし、GitHub Pages に公開する。

https://chocotto518.github.io/book-recap/

初回のみ、リポジトリの Settings → Pages → Build and deployment → Source を「GitHub Actions」にする。
