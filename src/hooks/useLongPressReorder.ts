import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type PointerEvent, type SyntheticEvent } from 'react';

const LONG_PRESS_MS = 400;
/** 長押しが成立する前にこれ以上動いたら、並べ替えではなくスクロールとみなす */
const MOVE_TOLERANCE = 8;

type Drag = {
  id: string;
  from: number;
  over: number;
  startX: number;
  startY: number;
  x: number;
  y: number;
  /** 長押しが成立した時点の各要素の位置 */
  rects: DOMRect[];
};

type Pending = { id: string; index: number; x: number; y: number; pointerId: number; timer: number };

const move = <T,>(list: T[], from: number, to: number) => {
  const next = list.slice();
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
};

/** 指の位置にいちばん近い枠の番号 */
const nearestIndex = (rects: DOMRect[], x: number, y: number) => {
  let best = 0;
  let bestDist = Infinity;
  rects.forEach((r, i) => {
    if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
      best = i;
      bestDist = -1;
      return;
    }
    if (bestDist < 0) return;
    const dist = Math.hypot(x - (r.left + r.width / 2), y - (r.top + r.height / 2));
    if (dist < bestDist) {
      best = i;
      bestDist = dist;
    }
  });
  return best;
};

/**
 * 長押しで並べ替え。
 * 長押しすると掴んだ要素が指に付いてきて、他の要素は入る場所を空けるように動く。離すと onReorder が呼ばれる。
 * 長押しにならなかった普通のタップは、そのまま onClick に届く。
 */
export function useLongPressReorder<T extends { id: string }>(items: T[], onReorder: (items: T[]) => void) {
  const [drag, setDrag] = useState<Drag | null>(null);
  const dragRef = useRef<Drag | null>(null);
  const pending = useRef<Pending | null>(null);
  const els = useRef(new Map<string, HTMLElement>());
  const suppressClickUntil = useRef(0);
  const settle = useRef<{ id: string; rect: DOMRect } | null>(null);
  const latest = useRef({ items, onReorder });
  latest.current = { items, onReorder };

  const setDragState = (next: Drag | null) => {
    dragRef.current = next;
    setDrag(next);
  };

  const cancelPending = () => {
    if (pending.current) window.clearTimeout(pending.current.timer);
    pending.current = null;
  };

  useEffect(() => {
    const onMove = (e: globalThis.PointerEvent) => {
      const p = pending.current;
      if (p && e.pointerId === p.pointerId && Math.hypot(e.clientX - p.x, e.clientY - p.y) > MOVE_TOLERANCE) {
        cancelPending();
      }
      const d = dragRef.current;
      if (!d) return;
      setDragState({ ...d, x: e.clientX, y: e.clientY, over: nearestIndex(d.rects, e.clientX, e.clientY) });
    };

    const onEnd = () => {
      cancelPending();
      const d = dragRef.current;
      if (!d) return;
      suppressClickUntil.current = Date.now() + 400;
      const el = els.current.get(d.id);
      if (el) settle.current = { id: d.id, rect: el.getBoundingClientRect() };
      setDragState(null);
      const { items: current, onReorder: reorder } = latest.current;
      if (d.from !== d.over) reorder(move(current, d.from, d.over));
    };

    // 並べ替え中は画面がスクロールしないようにする（passive: false でないと止められない）
    const onTouchMove = (e: TouchEvent) => {
      if (dragRef.current && e.cancelable) e.preventDefault();
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onEnd);
    window.addEventListener('pointercancel', onEnd);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    return () => {
      cancelPending();
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onEnd);
      window.removeEventListener('pointercancel', onEnd);
      window.removeEventListener('touchmove', onTouchMove);
    };
  }, []);

  // 離した位置から新しい場所へすっと収まる
  useLayoutEffect(() => {
    const s = settle.current;
    settle.current = null;
    const el = s && els.current.get(s.id);
    if (!s || !el) return;
    const last = el.getBoundingClientRect();
    el.animate(
      [{ transform: `translate(${s.rect.left - last.left}px, ${s.rect.top - last.top}px)` }, { transform: 'none' }],
      { duration: 200, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' },
    );
  });

  const order = drag ? move(items.map((it) => it.id), drag.from, drag.over) : null;

  const itemProps = (id: string, index: number) => {
    let style: CSSProperties | undefined;
    if (drag && order) {
      if (id === drag.id) {
        style = {
          transform: `translate(${drag.x - drag.startX}px, ${drag.y - drag.startY}px) scale(1.04)`,
          zIndex: 2,
          boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
        };
      } else {
        const to = drag.rects[order.indexOf(id)];
        const from = drag.rects[index];
        style = {
          transform: `translate(${to.left - from.left}px, ${to.top - from.top}px)`,
          transition: 'transform 0.2s ease',
        };
      }
    }

    return {
      ref: (el: HTMLElement | null) => {
        if (el) els.current.set(id, el);
        else els.current.delete(id);
      },
      style,
      'data-dragging': drag?.id === id ? true : undefined,
      onPointerDown: (e: PointerEvent<HTMLElement>) => {
        if (e.button !== 0 || dragRef.current) return;
        cancelPending();
        const { clientX: x, clientY: y, pointerId } = e;
        const timer = window.setTimeout(() => {
          pending.current = null;
          const current = latest.current.items;
          const rects = current.map((it) => els.current.get(it.id)!.getBoundingClientRect());
          setDragState({ id, from: index, over: index, startX: x, startY: y, x, y, rects });
          navigator.vibrate?.(15);
        }, LONG_PRESS_MS);
        pending.current = { id, index, x, y, pointerId, timer };
      },
      // 長押しの後に来るクリックでモーダルが開かないようにする
      onClickCapture: (e: SyntheticEvent) => {
        if (Date.now() < suppressClickUntil.current) {
          e.preventDefault();
          e.stopPropagation();
        }
      },
      // Android の長押しメニューを出さない
      onContextMenu: (e: SyntheticEvent) => e.preventDefault(),
    };
  };

  return { itemProps, dragging: drag !== null };
}
