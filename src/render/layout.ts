import type { TemplateType } from '../constants/template';

/**
 * 書き出し画像（1080×1440）のレイアウト定義。
 * Figma のテンプレート見本（public/images/count-*.png とカラー見本）を実測した値。
 * 画面上のプレビューと書き出しの両方がこの定義から描かれる。
 */
export type Rect = { x: number; y: number; w: number; h: number };

export const CANVAS = { width: 1080, height: 1440 };

export const FONT_FAMILY = '"IBM Plex Sans JP", "Hiragino Sans", "Noto Sans JP", sans-serif';

export const TEXT = {
  header: { size: 24, weight: 500, centerY: 58, lineY: 59, gap: 32 },
  footer: { size: 16, weight: 400, centerY: 1380, lineY: 1379, gap: 32 },
  copyright: { size: 11, weight: 400, centerY: 1407.5, text: '表紙画像の著作権は各出版社・著作者に帰属します' },
  title: { size: 36, weight: 700, lineHeight: 52, maxLines: 2 },
  author: { size: 32, weight: 400 },
  comment: { size: 24, weight: 400, lineHeight: 32 },
};

const rects = (xs: number[], ys: number[], w: number, h: number): Rect[] =>
  ys.flatMap((y) => xs.map((x) => ({ x, y, w, h })));

/** リスト型：書影の位置。文字は書影の右（1 冊のときは下）に置く */
export const LIST_COVERS: Record<number, Rect[]> = {
  4: rects([63], [120, 428, 736, 1044], 184, 276),
  3: rects([63], [121, 531, 941], 252, 378),
  2: rects([63], [120, 736], 389, 584),
  1: rects([300], [172], 480, 720),
};

export const LIST_TEXT = {
  /** 書影の右端から文字までの間隔 */
  gapFromCover: 66,
  /** 文字の右端 */
  right: 997,
  /** タイトル最終行の中心 → 作者の中心 */
  titleToAuthor: 52.5,
  /** 作者の中心 → 感想 1 行目の中心 */
  authorToComment: 58.5,
  /** 1 冊のとき：書影の下端からタイトル中心まで、感想の左右 */
  single: { titleOffset: 55.5, commentLeft: 129, commentRight: 951 },
};

/** グリッド型：書影の位置。タイトル・作者は書影の下の高さ 144px のエリアに中央揃え */
export const GRID_COVERS: Record<number, Rect[]> = {
  6: rects([73, 401, 729], [144, 752], 278, 416),
  5: [...rects([73, 401, 729], [144], 278, 416), ...rects([237, 565], [752], 278, 416)],
  4: rects([155, 647], [136, 736], 278, 416),
  3: rects([64, 392, 720], [426], 296, 444),
  2: rects([64, 556], [303], 460, 690),
  1: rects([260], [220], 560, 840),
};

export const GRID_TEXT = {
  areaHeight: 144,
  /** 書影の下端 → タイトル中心 / 作者中心 */
  titleOffset: 39.5,
  authorOffset: 91,
  /** 書影の幅に対して左右にはみ出してよい幅 */
  overflow: 20,
};

export const coversFor = (type: TemplateType, count: number) => (type === 'list' ? LIST_COVERS : GRID_COVERS)[count] ?? [];
