import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react';
import styles from './ColorCarousel.module.css';

const CARD_MAX_WIDTH = 335;
const GAP = 12;
/** 隣のカードが画面幅のこの割合以上を占めたら、そのカードへ移る */
const SNAP_RATIO = 0.6;
/** これより速く払ったら、60% に届かなくても隣へ移る（px/ms） */
const FLICK_VELOCITY = 0.6;
const AXIS_LOCK = 6;

type ColorCarouselProps = {
  count: number;
  index: number;
  onIndexChange: (index: number) => void;
  /** 真ん中のカードをタップしたとき */
  onSelectCurrent?: () => void;
  renderCard: (index: number) => ReactNode;
  /** 読み上げ用：各カードの名前 */
  labelOf: (index: number) => string;
  /** ドラッグ中、いま一番大きく見えているカードを知らせる（カラーボタンの表示用） */
  onPeek?: (index: number) => void;
};

type Gesture = {
  pointerId: number;
  startX: number;
  startY: number;
  axis: 'x' | 'y' | null;
  samples: { x: number; t: number }[];
};

/**
 * 横にスライドして選ぶカード。指を離したとき、隣のカードが画面の 60% 以上を占めていればそのカード、
 * そうでなければ元のカードが中央にピタッと収まる。
 */
export function ColorCarousel({
  count,
  index,
  onIndexChange,
  onSelectCurrent,
  renderCard,
  labelOf,
  onPeek,
}: ColorCarouselProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [viewportWidth, setViewportWidth] = useState(375);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const gesture = useRef<Gesture | null>(null);
  const suppressClick = useRef(false);

  useLayoutEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const update = () => setViewportWidth(el.clientWidth);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const cardWidth = Math.min(CARD_MAX_WIDTH, viewportWidth - 40);
  const pitch = cardWidth + GAP;
  const offset = (viewportWidth - cardWidth) / 2;

  /** index 番目のカードが、今の位置で画面幅の何割見えているか */
  const visibleRatio = (i: number, dx: number) => {
    const left = offset + (i - index) * pitch + dx;
    const visible = Math.min(left + cardWidth, viewportWidth) - Math.max(left, 0);
    return Math.max(0, visible) / viewportWidth;
  };

  const mostVisible = (dx: number) => {
    let best = index;
    for (let i = 0; i < count; i++) if (visibleRatio(i, dx) > visibleRatio(best, dx)) best = i;
    return best;
  };

  const peek = dragging ? mostVisible(dragX) : index;
  useEffect(() => {
    onPeek?.(peek);
  }, [peek, onPeek]);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    gesture.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      axis: null,
      samples: [{ x: e.clientX, t: e.timeStamp }],
    };
    suppressClick.current = false;
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const g = gesture.current;
    if (!g || g.pointerId !== e.pointerId) return;
    const dx = e.clientX - g.startX;
    const dy = e.clientY - g.startY;
    if (!g.axis) {
      if (Math.abs(dx) < AXIS_LOCK && Math.abs(dy) < AXIS_LOCK) return;
      g.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
      if (g.axis === 'y') {
        gesture.current = null;
        return;
      }
      e.currentTarget.setPointerCapture(e.pointerId);
      setDragging(true);
    }
    g.samples.push({ x: e.clientX, t: e.timeStamp });
    if (g.samples.length > 6) g.samples.shift();
    // 端より先へは重く動く
    const atStart = index === 0 && dx > 0;
    const atEnd = index === count - 1 && dx < 0;
    setDragX(atStart || atEnd ? dx / 3 : dx);
  };

  const onPointerEnd = (e: PointerEvent<HTMLDivElement>) => {
    const g = gesture.current;
    gesture.current = null;
    if (!g || g.pointerId !== e.pointerId || g.axis !== 'x') return;
    suppressClick.current = true;

    const first = g.samples[0];
    const last = g.samples[g.samples.length - 1];
    const velocity = (last.x - first.x) / Math.max(1, last.t - first.t);

    let next = index;
    const candidate = mostVisible(dragX);
    if (candidate !== index && visibleRatio(candidate, dragX) >= SNAP_RATIO) next = candidate;
    else if (velocity <= -FLICK_VELOCITY && index < count - 1 && dragX < 0) next = Math.max(index + 1, candidate);
    else if (velocity >= FLICK_VELOCITY && index > 0 && dragX > 0) next = Math.min(index - 1, candidate);

    setDragging(false);
    setDragX(0);
    if (next !== index) onIndexChange(next);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight' && index < count - 1) onIndexChange(index + 1);
    if (e.key === 'ArrowLeft' && index > 0) onIndexChange(index - 1);
  };

  const translate = offset - index * pitch + dragX;

  return (
    <div
      ref={viewportRef}
      className={styles.viewport}
      role="region"
      aria-roledescription="カルーセル"
      aria-label="カラー"
      tabIndex={0}
      onKeyDown={onKeyDown}
    >
      <div
        className={`${styles.track} ${dragging ? styles.dragging : ''}`}
        style={{ transform: `translateX(${translate}px)`, gap: GAP }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
      >
        {Array.from({ length: count }, (_, i) => (
          <button
            key={i}
            type="button"
            className={styles.card}
            style={{ width: cardWidth }}
            aria-label={labelOf(i)}
            aria-current={i === index ? 'true' : undefined}
            tabIndex={-1}
            onClick={() => {
              if (suppressClick.current) {
                suppressClick.current = false;
                return;
              }
              if (i === index) onSelectCurrent?.();
              else onIndexChange(i);
            }}
          >
            {renderCard(i)}
          </button>
        ))}
      </div>
    </div>
  );
}
