/** 画像のカラー。Figma のカラーボタン（book/pink など）と書き出し画像の配色 */
export type ColorId = 'default' | 'pink' | 'orange' | 'blue' | 'purple' | 'green' | 'brown';

export type Palette = {
  id: ColorId;
  label: string;
  /** テーマ・本のタイトル・ユーザー名・区切り線の色。カラーボタンの色でもある */
  accent: string;
  /** 画像の背景 */
  background: string;
  /** 感想の文字色 */
  comment: string;
};

export const AUTHOR_COLOR = '#6b6b6b';
export const COPYRIGHT_COLOR = '#7e7c7d';

export const PALETTES: Palette[] = [
  { id: 'default', label: 'デフォルト', accent: '#000000', background: '#ffffff', comment: '#000000' },
  { id: 'pink', label: 'ピンク', accent: '#b8396b', background: '#fdf8fa', comment: '#000000' },
  { id: 'orange', label: 'オレンジ', accent: '#c2591e', background: '#fdf9f7', comment: '#000000' },
  { id: 'blue', label: 'ブルー', accent: '#2e6690', background: '#f8fafb', comment: '#000000' },
  { id: 'purple', label: 'パープル', accent: '#6d3e82', background: '#faf8fb', comment: '#000000' },
  { id: 'green', label: 'グリーン', accent: '#3f7a42', background: '#f8faf8', comment: '#000000' },
  { id: 'brown', label: 'ブラウン', accent: '#6b4631', background: '#faf9f8', comment: '#000000' },
];

export const paletteOf = (id: ColorId | undefined) => PALETTES.find((p) => p.id === id) ?? PALETTES[0];
