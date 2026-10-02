/** 出力画像サイズ（3:4 固定） */
export const OUTPUT_WIDTH = 1080;
export const OUTPUT_HEIGHT = 1440;

/**
 * テンプレートの種類
 * - list: リスト型（感想あり）書影＋タイトル／作者／感想を横並びの行で縦積み
 * - grid: グリッド型（感想なし）タイトル・作者のみ
 */
export type TemplateType = 'list' | 'grid';

/** 1枚あたりの最大冊数 */
export const MAX_BOOKS: Record<TemplateType, number> = {
  list: 4,
  grid: 6,
};

/** リスト型の冊数ごとの感想の文字数上限 */
export const COMMENT_MAX_LENGTH: Record<number, number> = {
  4: 80,
  3: 120,
  2: 160,
  1: 200,
};

export const templateTypeFromComment = (hasComment: boolean): TemplateType => (hasComment ? 'list' : 'grid');

/** 選べる冊数（多い順） */
export const bookCountOptions = (type: TemplateType): number[] =>
  Array.from({ length: MAX_BOOKS[type] }, (_, i) => MAX_BOOKS[type] - i);
