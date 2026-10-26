import { bookCountOptions, type TemplateType } from '../constants/template';

/**
 * テンプレート設定・投稿情報で使う見本画像（WebP、`src/assets/samples/`）。
 * Vite が中身に応じた印をファイル名に付けるので、画像を差し替えるとすぐ新しいものが読み込まれる
 * （public に置くと同じ名前のまま公開され、ブラウザや GitHub Pages が古い画像を覚えていることがある）。
 * 作品数の選択（count-*）は拡大表示（幅約 300px）でもぼやけない 900px 幅、
 * 感想の有無（template-*）は表示 86×114 の 4 倍、投稿情報（post-info-*）は表示 195×260 の 3 倍
 */
const SAMPLES = import.meta.glob<string>('../assets/samples/*.webp', { eager: true, import: 'default' });

const image = (name: string) => {
  const url = SAMPLES[`../assets/samples/${name}.webp`];
  if (!url) throw new Error(`見本画像がありません：${name}`);
  return url;
};

export const templateTypeThumbnail = (type: TemplateType) => image(`template-${type}`);
export const bookCountThumbnail = (type: TemplateType, count: number) => image(`count-${type}-${count}`);
export const postInfoSample = (type: TemplateType, count: number) => image(`post-info-${type}-${count}`);

let preloaded = false;

/** 作品数の選択の見本を先に読み込んでおく（最初の画面を開いたときに呼ぶ。進んだときにすぐ出るように） */
export function preloadBookCountThumbnails() {
  if (preloaded || typeof Image === 'undefined') return;
  preloaded = true;
  for (const type of ['list', 'grid'] as const) {
    for (const count of bookCountOptions(type)) {
      const img = new Image();
      img.decoding = 'async';
      img.src = bookCountThumbnail(type, count);
    }
  }
}
