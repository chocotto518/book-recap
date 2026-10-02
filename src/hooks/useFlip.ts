import { useLayoutEffect, useRef, type RefObject } from 'react';
import { getScroller } from '../lib/scroller';

const DURATION = 400;
const EASING = 'cubic-bezier(0.2, 0.8, 0.2, 1)';

type Pending = { key: string; rect: DOMRect; scrollTo: number };

/**
 * FLIP アニメーション。
 * capture() で状態を切り替える前の要素の位置を覚えておき、再描画後に同じ data-flip を持つ要素を
 * 元の位置・大きさから新しい位置・大きさへ動かす。
 */
export function useFlip(rootRef: RefObject<HTMLElement | null>, deps: unknown[]) {
  const pending = useRef<Pending | null>(null);

  const find = (key: string) => rootRef.current?.querySelector<HTMLElement>(`[data-flip="${key}"]`) ?? null;

  /** 切り替え前に呼ぶ。scrollTo は再描画後に戻したいスクロール位置 */
  const capture = (key: string, scrollTo: number) => {
    const el = find(key);
    if (el) pending.current = { key, rect: el.getBoundingClientRect(), scrollTo };
  };

  useLayoutEffect(() => {
    const p = pending.current;
    pending.current = null;
    if (!p) return;

    getScroller(rootRef.current).scrollTop = p.scrollTo;
    const el = find(p.key);
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const last = el.getBoundingClientRect();
    const dx = p.rect.left - last.left;
    const dy = p.rect.top - last.top;
    const sx = p.rect.width / last.width;
    const sy = p.rect.height / last.height;

    // 拡大・縮小中は他の要素より手前に出す
    el.style.zIndex = '1';
    const animation = el.animate(
      [
        { transformOrigin: 'top left', transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})` },
        { transformOrigin: 'top left', transform: 'none' },
      ],
      { duration: DURATION, easing: EASING },
    );
    animation.onfinish = animation.oncancel = () => {
      el.style.zIndex = '';
    };
  }, deps);

  return capture;
}
