# book-recap

自分なりのテーマで、人に紹介したい本を 1 枚の画像（1080×1440）にまとめるウェブアプリ。

## 開発

```sh
npm install
npm run dev
```

## 画面フロー

テンプレート設定（感想の有無 → 作品数）→ デザイン選択 → 編集（投稿情報 → 本の登録 → カラー選択）

## 構成

- Vite + React + TypeScript、スタイルは CSS Modules
- デザイントークン: `src/styles/global.css`
- 共通コンポーネント: `src/components`（Header / Stepbar / TemplateOptionCard）
- 画面: `src/screens`
