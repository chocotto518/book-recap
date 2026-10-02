import { renderRecapCanvas, type RecapInput } from './renderRecap';

/** 書き出す PNG（1080×1440）を作る */
export async function createRecapPng(input: RecapInput): Promise<File> {
  const canvas = await renderRecapCanvas({ ...input, fillEmpty: false }, 1);
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('PNG を作れませんでした'))), 'image/png'),
  );
  const date = new Date();
  const stamp = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
  return new File([blob], `book-recap-${stamp}.png`, { type: 'image/png' });
}

/**
 * スマホなど、共有シートで画像ファイルを渡せる端末か。
 * PC のブラウザにも共有できるものがあるが、PC はダウンロードのほうが分かりやすいので指で操作する端末に限る
 */
export function canShareImage(file: File) {
  return (
    typeof navigator !== 'undefined' &&
    typeof navigator.canShare === 'function' &&
    navigator.canShare({ files: [file] }) &&
    window.matchMedia('(pointer: coarse)').matches
  );
}

export function downloadFile(file: File) {
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

/** 共有シートを開く。ユーザーが閉じた（キャンセルした）ときは false */
export async function shareFile(file: File, text?: string) {
  try {
    await navigator.share({ files: [file], text });
    return true;
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') return false;
    throw e;
  }
}

/** X の投稿画面（画像は添付できないので文章だけ） */
export function openXIntent(text: string) {
  const url = `https://x.com/intent/post?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank', 'noopener');
}
