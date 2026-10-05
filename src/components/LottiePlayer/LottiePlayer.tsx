import { useEffect, useRef } from 'react';

type LottiePlayerProps = {
  /** Lottie の JSON（`import()` で読み込むと、使う画面を開くまで取りに行かない） */
  load: () => Promise<{ default: unknown }>;
  width: number;
  height: number;
  className?: string;
};

/**
 * Lottie アニメーションを SVG で再生する（ループ）。
 * 動きを減らす設定の端末では最初のコマで止める
 */
export function LottiePlayer({ load, width, height, className }: LottiePlayerProps) {
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
      destroy = () => anim.destroy();
    });
    return () => {
      cancelled = true;
      destroy();
    };
  }, [load]);

  return <div ref={ref} className={className} style={{ width, height }} aria-hidden="true" />;
}
