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

export const templateTypeFromComment = (hasComment: boolean): TemplateType => (hasComment ? 'list' : 'grid');
