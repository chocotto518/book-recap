import { useSyncExternalStore } from 'react';
import { newId } from './project';

/**
 * 書影画像の保存場所。
 * 入力のたびにプロジェクト全体を保存し直すと画像ぶん重くなるため、画像は 1 枚ずつ別のキーで localStorage に置く。
 * 容量オーバーなどで保存できないときは、開いている間だけメモリに持つ。
 */
const PREFIX = 'book-recap:cover:';
const memory = new Map<string, string>();
const listeners = new Set<() => void>();

const notify = () => listeners.forEach((l) => l());

export function getCover(id: string | null): string | null {
  if (!id) return null;
  if (memory.has(id)) return memory.get(id)!;
  try {
    const saved = localStorage.getItem(PREFIX + id);
    if (saved) memory.set(id, saved);
    return saved;
  } catch {
    return null;
  }
}

export function saveCover(dataUrl: string): string {
  const id = newId();
  memory.set(id, dataUrl);
  try {
    localStorage.setItem(PREFIX + id, dataUrl);
  } catch {
    // 保存できなくても、開いている間は表示・書き出しに使える
  }
  notify();
  return id;
}

/** 使われていない書影を消す */
export function pruneCovers(usedIds: (string | null)[]) {
  const used = new Set(usedIds.filter(Boolean));
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key?.startsWith(PREFIX) && !used.has(key.slice(PREFIX.length))) localStorage.removeItem(key);
    }
  } catch {
    // 何もしない
  }
  for (const id of memory.keys()) if (!used.has(id)) memory.delete(id);
}

export function useCover(id: string | null): string | null {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => getCover(id),
  );
}

/**
 * 画像（端末から選んだ・撮った・貼り付けた）を読み込む。読めない画像なら失敗する。
 * 使い終わったら `URL.revokeObjectURL(img.src)` で片付ける
 */
export async function loadImageBlob(blob: Blob): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(blob);
  const img = new Image();
  img.src = url;
  try {
    await img.decode();
    return img;
  } catch (e) {
    URL.revokeObjectURL(url);
    throw e;
  }
}

export type CropRect = { x: number; y: number; w: number; h: number };

/** 画像の一部（元の画像の大きさでの範囲）を切り出し、長辺 maxSize の JPEG の data URL にする */
export function cropToDataUrl(img: HTMLImageElement, rect: CropRect, maxSize = 900): string {
  const scale = Math.min(1, maxSize / Math.max(rect.w, rect.h));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(rect.w * scale));
  canvas.height = Math.max(1, Math.round(rect.h * scale));
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, rect.x, rect.y, rect.w, rect.h, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.85);
}

