import { useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { Button } from '../Button/Button';
import { Dialog } from '../Dialog/Dialog';
import type { CropRect } from '../../state/covers';
import styles from './CoverCropDialog.module.css';

type CoverCropDialogProps = {
  /** 切り抜く画像。null のあいだは閉じている */
  image: HTMLImageElement | null;
  onCancel: () => void;
  /** 決定：元の画像の大きさでの切り抜き範囲 */
  onConfirm: (rect: CropRect) => void;
};

/** 画面に表示する画像の最大の大きさ（ポップアップの内側の幅 303px） */
const MAX_WIDTH = 303;
const maxHeight = () => Math.min(400, Math.round(window.innerHeight * 0.5));
/** 枠の最小の大きさ（画面上の px） */
const MIN_SIZE = 32;

type Corner = 'nw' | 'ne' | 'sw' | 'se';
type Drag = { mode: Corner | 'move'; startX: number; startY: number; start: CropRect };

/** 書影：撮った・選んだ・貼り付けた画像から、表紙の部分を四角く切り抜く（仮デザイン） */
export function CoverCropDialog({ image, onCancel, onConfirm }: CoverCropDialogProps) {
  return (
    <Dialog open={image !== null} onClose={onCancel} label="表紙の部分を切り抜く">
      {image && <Cropper key={image.src} image={image} onCancel={onCancel} onConfirm={onConfirm} />}
    </Dialog>
  );
}

function Cropper({ image, onCancel, onConfirm }: { image: HTMLImageElement } & Omit<CoverCropDialogProps, 'image'>) {
  const nw = image.naturalWidth;
  const nh = image.naturalHeight;
  // 画面上の 1px が元の画像の何 px か
  const scale = useMemo(() => Math.min(MAX_WIDTH / nw, maxHeight() / nh), [nw, nh]);
  // はじめは画像全体（そのまま「決定」なら切り抜かない）
  const [rect, setRect] = useState<CropRect>({ x: 0, y: 0, w: nw, h: nh });
  const drag = useRef<Drag | null>(null);

  const startDrag = (mode: Drag['mode']) => (e: ReactPointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    drag.current = { mode, startX: e.clientX, startY: e.clientY, start: rect };
  };

  const onPointerMove = (e: ReactPointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const dx = (e.clientX - d.startX) / scale;
    const dy = (e.clientY - d.startY) / scale;
    const min = MIN_SIZE / scale;
    const s = d.start;
    if (d.mode === 'move') {
      setRect({ ...s, x: clamp(s.x + dx, 0, nw - s.w), y: clamp(s.y + dy, 0, nh - s.h) });
      return;
    }
    let left = s.x;
    let top = s.y;
    let right = s.x + s.w;
    let bottom = s.y + s.h;
    if (d.mode === 'nw' || d.mode === 'sw') left = clamp(left + dx, 0, right - min);
    if (d.mode === 'ne' || d.mode === 'se') right = clamp(right + dx, left + min, nw);
    if (d.mode === 'nw' || d.mode === 'ne') top = clamp(top + dy, 0, bottom - min);
    if (d.mode === 'sw' || d.mode === 'se') bottom = clamp(bottom + dy, top + min, nh);
    setRect({ x: left, y: top, w: right - left, h: bottom - top });
  };

  const endDrag = () => {
    drag.current = null;
  };

  const box = { left: rect.x * scale, top: rect.y * scale, width: rect.w * scale, height: rect.h * scale };

  return (
    <div className={styles.content}>
      <div className={styles.heading}>
        <p className={styles.title}>表紙の部分を切り抜く</p>
        <p className={styles.hint}>枠の角を動かして、表紙だけを囲んでください</p>
      </div>
      <div
        className={styles.stage}
        style={{ width: nw * scale, height: nh * scale }}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <img className={styles.image} src={image.src} alt="" draggable={false} />
        {/* 枠の外を暗くする（上・下・左・右の 4 枚） */}
        <div className={styles.shade} style={{ left: 0, top: 0, right: 0, height: box.top }} />
        <div className={styles.shade} style={{ left: 0, top: box.top + box.height, right: 0, bottom: 0 }} />
        <div className={styles.shade} style={{ left: 0, top: box.top, width: box.left, height: box.height }} />
        <div
          className={styles.shade}
          style={{ left: box.left + box.width, top: box.top, right: 0, height: box.height }}
        />
        <div className={styles.frame} style={box} onPointerDown={startDrag('move')}>
          {(['nw', 'ne', 'sw', 'se'] as const).map((corner) => (
            <span
              key={corner}
              className={`${styles.handle} ${styles[corner]}`}
              onPointerDown={startDrag(corner)}
              aria-hidden="true"
            />
          ))}
        </div>
      </div>
      <div className={styles.actions}>
        <Button variant="outline" size="M" onClick={onCancel}>
          キャンセル
        </Button>
        <Button size="M" onClick={() => onConfirm(roundRect(rect))}>
          決定
        </Button>
      </div>
    </div>
  );
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const roundRect = (r: CropRect): CropRect => ({
  x: Math.round(r.x),
  y: Math.round(r.y),
  w: Math.max(1, Math.round(r.w)),
  h: Math.max(1, Math.round(r.h)),
});
