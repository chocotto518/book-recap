import { useEffect, useRef } from 'react';
import { renderRecapCanvas, type RecapInput } from '../../render/renderRecap';
import { CANVAS } from '../../render/layout';
import styles from './RecapPreview.module.css';

type RecapPreviewProps = {
  input: RecapInput;
  /** 描画の解像度（1 で 1080×1440）。小さく表示するカードは下げてメモリを節約する */
  scale?: number;
  className?: string;
  label?: string;
};

/**
 * 書き出し画像と同じ描画（renderRecap）で作るプレビュー。
 * 入力が変わるたびに裏で描き直し、描き終わったものだけを表示に反映する。
 */
export function RecapPreview({ input, scale = 1, className, label }: RecapPreviewProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const key = JSON.stringify(input);

  useEffect(() => {
    let cancelled = false;
    void renderRecapCanvas(input, scale).then((offscreen) => {
      const canvas = ref.current;
      if (cancelled || !canvas) return;
      canvas.width = offscreen.width;
      canvas.height = offscreen.height;
      canvas.getContext('2d')!.drawImage(offscreen, 0, 0);
    });
    return () => {
      cancelled = true;
    };
    // input は中身が同じなら描き直さないよう、文字列にした key で比べる
  }, [key, scale]);

  return (
    <canvas
      ref={ref}
      className={`${styles.canvas} ${className ?? ''}`}
      width={Math.round(CANVAS.width * scale)}
      height={Math.round(CANVAS.height * scale)}
      role="img"
      aria-label={label ?? '画像のプレビュー'}
    />
  );
}
