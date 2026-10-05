import type { TemplateType } from '../constants/template';

/**
 * 書き出し画像（1080×1440）のレイアウト定義。
 * Figma のテンプレート見本（public/images/count-*.png とカラー見本）を実測した値。
 * 画面上のプレビューと書き出しの両方がこの定義から描かれる。
 */
export type Rect = { x: number; y: number; w: number; h: number };

export const CANVAS = { width: 1080, height: 1440 };

export const FONT_FAMILY = '"IBM Plex Sans JP", "Hiragino Sans", "Noto Sans JP", sans-serif';

/** テーマ・ユーザー名に付く罫線の太さ（すべてのテンプレート共通） */
export const RULE_WIDTH = 2;

export const TEXT = {
  /** lineY は罫線の上端。罫線の太さは RULE_WIDTH */
  header: { size: 24, weight: 500, centerY: 58, lineY: 58, gap: 24 },
  footer: { size: 16, weight: 400, centerY: 1379, lineY: 1378, gap: 24 },
  copyright: {
    size: 11,
    weight: 400,
    centerY: 1407.5,
    /** テーマあり・ユーザー名なしのとき（線のすぐ下に寄せる） */
    centerYWithoutUser: 1398.5,
    text: '表紙画像の著作権は各出版社・著作者に帰属します',
  },
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
  gapFromCover: 34,
  /** 文字の右端 */
  right: 1017,
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
  /** 書影の下の文字エリアの高さ。タイトル・作者はこの中に収める */
  areaHeight: 144,
  /** タイトル：32px・最大 2 行。収まらなければ minSize まで小さくする */
  title: { size: 32, minSize: 20, weight: 700, lineHeightRatio: 1.25, maxLines: 2 },
  /** 作者：24px・最大 2 行。収まらなければ minSize まで小さくする */
  author: { size: 24, minSize: 20, weight: 400, lineHeightRatio: 4 / 3, maxLines: 2 },
  /** 書影の下端 → タイトル 1 行目の上端（32px 1 行のとき、中心が Figma の見本の位置に来る） */
  titleTop: 19.5,
  /** 文字が多いときに上に詰めてよい限界（書影の下端からの距離） */
  minTop: 8,
  /** タイトルの最後の行と作者の行の間隔 */
  gapTitleAuthor: 8,
  /** 書影の幅に対して左右にはみ出してよい幅（隣の列の文字とくっつかない程度） */
  overflow: 8,
};

export const coversFor = (type: TemplateType, count: number) => (type === 'list' ? LIST_COVERS : GRID_COVERS)[count] ?? [];
