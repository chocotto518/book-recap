import { useEffect, useRef } from 'react';

type LottiePlayerProps = {
  /** Lottie の JSON（`import()` で読み込むと、使う画面を開くまで取りに行かない） */
  load: () => Promise<{ default: unknown }>;
  width: number;
  height: number;
  className?: string;
  /** 元の大きさの外にはみ出す部分も描く（外側で切り取る） */
  overflowVisible?: boolean;
};

/**
 * Lottie アニメーションを SVG で再生する（ループ）。
 * 動きを減らす設定の端末では最初のコマで止める
 */
export function LottiePlayer({ load, width, height, className, overflowVisible = false }: LottiePlayerProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    let destroy = () => {};
    Promise.all([import('lottie-web/build/player/lottie_light'), load()]).then(([lottie, data]) => {
      if (cancelled || !ref.current) return;
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const anim = lottie.default.loadAnimation({
        container: ref.current,
        renderer: 'svg',
        loop: true,
        autoplay: !reduceMotion,
        animationData: data.default,
      });
      if (overflowVisible) {
        // lottie は元の大きさで切り取るので、その切り取りを外す
        anim.addEventListener('DOMLoaded', () => {
          ref.current?.querySelectorAll('[clip-path]').forEach((el) => el.removeAttribute('clip-path'));
          const svg = ref.current?.querySelector('svg');
          if (svg) svg.style.overflow = 'visible';
        });
      }
      destroy = () => anim.destroy();
    });
    return () => {
      cancelled = true;
      destroy();
    };
  }, [load, overflowVisible]);

  return <div ref={ref} className={className} style={{ width, height }} aria-hidden="true" />;
}
