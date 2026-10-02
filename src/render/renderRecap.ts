import { COMMENT_MAX_LENGTH } from '../constants/template';
import { getCover } from '../state/covers';
import { coverPlaceholder, isBookFilled, type Book, type Template } from '../state/project';
import { AUTHOR_COLOR, COPYRIGHT_COLOR, type Palette } from './colors';
import { CANVAS, coversFor, FONT_FAMILY, GRID_TEXT, LIST_TEXT, TEXT, type Rect } from './layout';
import { ellipsize, wrapText } from './text';

export type RecapInput = {
  template: Template;
  palette: Palette;
  theme: string;
  userName: string;
  books: Book[];
  /** 未入力の本・テーマ・ユーザー名に見本の文字を、書影がない枠に見本の画像を入れる（画面上のプレビュー用） */
  fillEmpty: boolean;
};

/** 未入力のときに見せる見本（Figma のテンプレート見本と同じ文言） */
export const SAMPLE = {
  theme: '心にグッと来た恋愛小説４選',
  userName: '@123_456',
  title: '本のタイトル',
  author: '作者',
  comment:
    '人は、自分では気づかないうちに、周囲の人や環境からさまざまな影響を受けている。だからこそ、ときには立ち止まって、自分が何を感じ、何を考えているのかを振り返ることが大切なのだと思う。誰かの言葉に心を動かされたり、思いがけない経験から新しい価値観が生まれたりすることで、少しずつ自分自身のことも理解できるようになる。そうした気づきを重ねていくことが、自分らしい選択や生き方を考えるきっかけになるのかもしれない。',
};

const font = (style: { size: number; weight: number }) => `${style.weight} ${style.size}px ${FONT_FAMILY}`;

const imageCache = new Map<string, Promise<HTMLImageElement | null>>();

function loadImage(src: string): Promise<HTMLImageElement | null> {
  let cached = imageCache.get(src);
  if (!cached) {
    cached = new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
    });
    imageCache.set(src, cached);
  }
  return cached;
}

/** 描画に使うフォントと画像を読み込む。フォントが読み込まれる前に描くと別の書体になるため */
async function prepare(input: RecapInput) {
  const texts = [input.theme, input.userName, ...input.books.flatMap((b) => [b.title, b.author, b.comment])].join('');
  const sample = Object.values(SAMPLE).join('') + TEXT.copyright.text;
  if (typeof document !== 'undefined' && document.fonts) {
    await Promise.all(
      [TEXT.header, TEXT.footer, TEXT.title, GRID_TEXT.title, { size: GRID_TEXT.title.minSize, weight: GRID_TEXT.title.weight }, TEXT.author, GRID_TEXT.author, TEXT.comment, TEXT.copyright].map((style) =>
        document.fonts.load(font(style), texts + sample).catch(() => []),
      ),
    );
  }
  const covers = await Promise.all(input.books.map((b) => (b.coverId ? loadImage(getCover(b.coverId) ?? '') : null)));
  const placeholder = input.fillEmpty ? await loadImage(coverPlaceholder) : null;
  return { covers, placeholder };
}

function drawImageContain(ctx: CanvasRenderingContext2D, img: HTMLImageElement, r: Rect) {
  const scale = Math.min(r.w / img.naturalWidth, r.h / img.naturalHeight);
  const w = img.naturalWidth * scale;
  const h = img.naturalHeight * scale;
  ctx.drawImage(img, r.x + (r.w - w) / 2, r.y + (r.h - h) / 2, w, h);
}

function drawImageCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, r: Rect) {
  const scale = Math.max(r.w / img.naturalWidth, r.h / img.naturalHeight);
  const w = img.naturalWidth * scale;
  const h = img.naturalHeight * scale;
  ctx.save();
  ctx.beginPath();
  ctx.rect(r.x, r.y, r.w, r.h);
  ctx.clip();
  ctx.drawImage(img, r.x + (r.w - w) / 2, r.y + (r.h - h) / 2, w, h);
  ctx.restore();
}

/** 中央の文字と、その左右に伸びる線 */
function drawRuledText(
  ctx: CanvasRenderingContext2D,
  text: string,
  style: { size: number; weight: number; centerY: number; lineY: number; gap: number },
  color: string,
) {
  ctx.fillStyle = color;
  ctx.font = font(style);
  const maxWidth = CANVAS.width - 2 * (64 + style.gap);
  const label = ellipsize(ctx, text, maxWidth);
  const width = label ? ctx.measureText(label).width : 0;
  ctx.textAlign = 'center';
  ctx.fillText(label, CANVAS.width / 2, style.centerY);
  const left = label ? CANVAS.width / 2 - width / 2 - style.gap : CANVAS.width / 2;
  const right = label ? CANVAS.width / 2 + width / 2 + style.gap : CANVAS.width / 2;
  ctx.fillRect(0, style.lineY, left, 1);
  ctx.fillRect(right, style.lineY, CANVAS.width - right, 1);
}

/** 1 冊の本の文字（タイトル・作者・感想）を、指定した位置から縦に並べて描く */
function drawBookText(
  ctx: CanvasRenderingContext2D,
  lines: { title: string[]; author: string; comment: string[] },
  firstCenterY: number,
  x: number,
  align: CanvasTextAlign,
  palette: Palette,
  commentX = x,
) {
  let y = firstCenterY;
  ctx.textAlign = align;
  ctx.fillStyle = palette.accent;
  ctx.font = font(TEXT.title);
  lines.title.forEach((line, i) => ctx.fillText(line, x, y + i * TEXT.title.lineHeight));
  y += (lines.title.length - 1) * TEXT.title.lineHeight;
  if (lines.author) {
    y += LIST_TEXT.titleToAuthor;
    ctx.fillStyle = AUTHOR_COLOR;
    ctx.font = font(TEXT.author);
    ctx.fillText(lines.author, x, y);
  }
  if (lines.comment.length) {
    y += LIST_TEXT.authorToComment;
    ctx.textAlign = 'left';
    ctx.fillStyle = palette.comment;
    ctx.font = font(TEXT.comment);
    lines.comment.forEach((line, i) => ctx.fillText(line, commentX, y + i * TEXT.comment.lineHeight));
  }
}

/** タイトル 1 行目の中心から最後の行の下端・上端までの距離（縦の中央揃えに使う） */
function blockExtent(lines: { title: string[]; author: string; comment: string[] }) {
  let last = (lines.title.length - 1) * TEXT.title.lineHeight;
  let bottomHalf = TEXT.title.lineHeight / 2;
  if (lines.author) {
    last += LIST_TEXT.titleToAuthor;
    bottomHalf = TEXT.author.size * 0.7;
  }
  if (lines.comment.length) {
    last += LIST_TEXT.authorToComment + (lines.comment.length - 1) * TEXT.comment.lineHeight;
    bottomHalf = TEXT.comment.lineHeight / 2;
  }
  return { top: -TEXT.title.lineHeight / 2, bottom: last + bottomHalf };
}

/** タイトルが maxLines 行に収まる最大の文字サイズを探す（収まらなければ最小サイズで末尾を「…」にする） */
function fitTitle(ctx: CanvasRenderingContext2D, title: string, width: number) {
  const { size, minSize, weight, maxLines } = GRID_TEXT.title;
  for (let s = size; s >= minSize; s -= 2) {
    ctx.font = font({ size: s, weight });
    const lines = wrapText(ctx, title, width);
    if (lines.length <= maxLines) return { size: s, lines };
  }
  ctx.font = font({ size: minSize, weight });
  return { size: minSize, lines: wrapText(ctx, title, width, maxLines) };
}

/** グリッド型：書影の下にタイトル（最大 2 行、収まらなければ縮小）と作者を中央揃えで描く */
function drawGridText(ctx: CanvasRenderingContext2D, title: string, author: string, rect: Rect, palette: Palette) {
  const width = rect.w + GRID_TEXT.overflow * 2;
  const cx = rect.x + rect.w / 2;
  const { size, lines } = title ? fitTitle(ctx, title, width) : { size: GRID_TEXT.title.size, lines: [] as string[] };
  const lineHeight = size * GRID_TEXT.title.lineHeightRatio;
  // 32px のときの 1 行目は見本と同じ位置。小さくしたときは行の上端をそろえる
  const baseLineHeight = GRID_TEXT.title.size * GRID_TEXT.title.lineHeightRatio;
  let y = rect.y + rect.h + GRID_TEXT.titleOffset - (baseLineHeight - lineHeight) / 2;

  ctx.textAlign = 'center';
  ctx.fillStyle = palette.accent;
  ctx.font = font({ size, weight: GRID_TEXT.title.weight });
  lines.forEach((line, i) => ctx.fillText(line, cx, y + i * lineHeight));
  y += Math.max(0, lines.length - 1) * lineHeight;

  if (author) {
    ctx.fillStyle = AUTHOR_COLOR;
    ctx.font = font(GRID_TEXT.author);
    const authorY = y + lineHeight / 2 + GRID_TEXT.gapTitleAuthor + GRID_TEXT.author.lineHeight / 2;
    ctx.fillText(ellipsize(ctx, author, width), cx, authorY);
  }
}

/** 1080×1440 の座標系で描く。ctx は呼び出し側で拡大縮小してよい */
export async function drawRecap(ctx: CanvasRenderingContext2D, input: RecapInput) {
  const { covers, placeholder } = await prepare(input);
  const { template, palette, fillEmpty } = input;
  const isList = template.type === 'list';
  const rects = coversFor(template.type, template.count);
  const commentMax = COMMENT_MAX_LENGTH[template.count] ?? 0;

  ctx.textBaseline = 'middle';
  ctx.fillStyle = palette.background;
  ctx.fillRect(0, 0, CANVAS.width, CANVAS.height);

  // ヘッダー（テーマ）とフッター（ユーザー名・著作権表記）
  drawRuledText(ctx, input.theme || (fillEmpty ? SAMPLE.theme : ''), TEXT.header, palette.accent);
  drawRuledText(ctx, input.userName || (fillEmpty ? SAMPLE.userName : ''), TEXT.footer, palette.accent);
  ctx.fillStyle = COPYRIGHT_COLOR;
  ctx.font = font(TEXT.copyright);
  ctx.textAlign = 'center';
  ctx.fillText(TEXT.copyright.text, CANVAS.width / 2, TEXT.copyright.centerY);

  rects.forEach((rect, i) => {
    const book = input.books[i];
    const cover = covers[i];
    if (cover) drawImageContain(ctx, cover, rect);
    else if (placeholder) drawImageCover(ctx, placeholder, rect);

    // 見本の文字は、まだ何も入力していない本にだけ入れる（入力途中の本は空欄のまま見せる）
    const sample = fillEmpty && !(book && isBookFilled(book));
    const title = book?.title || (sample ? SAMPLE.title : '');
    const author = book?.author || (sample ? SAMPLE.author : '');
    const comment = isList ? book?.comment || (sample ? [...SAMPLE.comment].slice(0, commentMax).join('') : '') : '';

    if (!isList) {
      drawGridText(ctx, title, author, rect, palette);
      return;
    }

    const single = template.count === 1;
    const textLeft = single ? LIST_TEXT.single.commentLeft : rect.x + rect.w + LIST_TEXT.gapFromCover;
    const textRight = single ? LIST_TEXT.single.commentRight : LIST_TEXT.right;
    const width = textRight - textLeft;

    ctx.font = font(TEXT.title);
    const titleLines = title ? wrapText(ctx, title, width, TEXT.title.maxLines) : [];
    ctx.font = font(TEXT.author);
    const authorLine = author ? ellipsize(ctx, author, width) : '';
    ctx.font = font(TEXT.comment);
    const commentLines = comment ? wrapText(ctx, comment, width) : [];
    const lines = { title: titleLines.length ? titleLines : [''], author: authorLine, comment: commentLines };

    if (single) {
      drawBookText(ctx, lines, rect.y + rect.h + LIST_TEXT.single.titleOffset, CANVAS.width / 2, 'center', palette, textLeft);
    } else {
      // 文字のまとまりを書影の縦中央に揃える
      const { top, bottom } = blockExtent(lines);
      const firstCenter = rect.y + rect.h / 2 - 2 - (top + bottom) / 2;
      drawBookText(ctx, lines, firstCenter, textLeft, 'left', palette);
    }
  });
}

/** 指定した倍率で描いた canvas を返す（1 で 1080×1440） */
export async function renderRecapCanvas(input: RecapInput, scale = 1, canvas = document.createElement('canvas')) {
  canvas.width = Math.round(CANVAS.width * scale);
  canvas.height = Math.round(CANVAS.height * scale);
  const ctx = canvas.getContext('2d')!;
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  await drawRecap(ctx, input);
  return canvas;
}
