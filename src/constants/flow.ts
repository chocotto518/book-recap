/**
 * 画面フロー
 *   テンプレート設定（感想の有無 → 作品数）→ 編集（投稿情報 → 本の登録 → カラー選択）→ 書き出し
 *   編集画面のヘッダーから、テンプレート設定とプレビューをモーダルで開ける
 */
export const TEMPLATE_SETTINGS_TITLE = 'テンプレート設定';
export const TEMPLATE_SETTINGS_STEPS = ['感想の有無', '作品数の選択'] as const;
/** 編集画面のメニューから開くテンプレート変更 */
export const TEMPLATE_CHANGE_TITLE = 'テンプレート変更';

export const EDIT_TITLE = '編集';
export const EDIT_STEPS = ['投稿情報', '本の登録', 'カラー選択'] as const;

export const PREVIEW_TITLE = 'プレビュー';

export const EXPORT_TITLE = '書き出し';
/** 編集の各ステップの後に続く、書き出し画面のステップ番号 */
export const EXPORT_STEP = EDIT_STEPS.length;
