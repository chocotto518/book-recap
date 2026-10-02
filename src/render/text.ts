/** 行頭に来てはいけない文字（句読点・閉じ括弧・小書き文字など） */
const NO_LINE_START = new Set([...'、。，．,.・：；:;！？!?）)］]｝}」』〉》】〕ー〜～ぁぃぅぇぉっゃゅょゎァィゥェォッャュョヮヵヶ々ゝゞヽヾ']);

const segmenter =
  typeof Intl !== 'undefined' && 'Segmenter' in Intl ? new Intl.Segmenter('ja', { granularity: 'word' }) : null;

/**
 * 折り返しの単位に分ける。ブラウザが対応していれば単語単位（「世界」「の」「中心」…）にして、
 * 単語の途中で改行しないようにする。対応していなければ英数字の単語だけをまとめ、日本語は 1 文字ずつ
 */
const tokenize = (text: string): string[] =>
  segmenter
    ? Array.from(segmenter.segment(text), (s) => s.segment)
    : (text.match(/[A-Za-z0-9@#'_\-.]+|\s|./gu) ?? []);

/** 日本語向けの折り返し。maxLines を超えた分は末尾を「…」にする */
export function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines = Infinity): string[] {
  const lines: string[] = [];
  for (const paragraph of text.split('\n')) {
    let line = '';
    // 1 行に収まらないほど長い単語は 1 文字ずつに分ける
    const tokens = tokenize(paragraph).flatMap((t) => (ctx.measureText(t).width > maxWidth ? [...t] : [t]));
    for (const token of tokens) {
      if (line && ctx.measureText(line + token).width > maxWidth) {
        // 行頭禁則：句読点などが行頭に来るときは、前の文字ごと次の行へ送る
        if (NO_LINE_START.has(token) && line.length > 1) {
          const chars = [...line];
          const carry = chars.pop()!;
          lines.push(chars.join(''));
          line = carry + token;
        } else {
          lines.push(line.trimEnd());
          line = token.trim() ? token : '';
        }
      } else {
        line += token;
      }
    }
    lines.push(line);
  }
  if (lines.length <= maxLines) return lines;
  const kept = lines.slice(0, maxLines);
  kept[maxLines - 1] = ellipsize(ctx, kept[maxLines - 1] + lines[maxLines], maxWidth);
  return kept;
}

/** 幅に収まらなければ末尾を「…」にする */
export function ellipsize(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  const chars = [...text];
  while (chars.length && ctx.measureText(chars.join('') + '…').width > maxWidth) chars.pop();
  return chars.join('') + '…';
}
