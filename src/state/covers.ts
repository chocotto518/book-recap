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

/** 端末から選んだ画像を、書き出しに十分な大きさ（長辺 900px）の JPEG に縮めて data URL にする */
export async function readCoverFile(file: File, maxSize = 900): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const scale = Math.min(1, maxSize / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.85);
  } finally {
    URL.revokeObjectURL(url);
  }
}
