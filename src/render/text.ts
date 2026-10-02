/** 行頭に来てはいけない文字（句読点・閉じ括弧・小書き文字など） */
const NO_LINE_START = new Set([...'、。，．,.・：；:;！？!?）)］]｝}」』〉》】〕ー〜～ぁぃぅぇぉっゃゅょゎァィゥェォッャュョヮヵヶ々ゝゞヽヾ']);

/** 英数字の単語は途中で折り返さないよう 1 まとまりにする */
const tokenize = (text: string) => text.match(/[A-Za-z0-9@#'_\-.]+|\s|./gu) ?? [];

/** 日本語向けの折り返し。maxLines を超えた分は末尾を「…」にする */
export function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines = Infinity): string[] {
  const lines: string[] = [];
  for (const paragraph of text.split('\n')) {
    let line = '';
    for (const token of tokenize(paragraph)) {
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
