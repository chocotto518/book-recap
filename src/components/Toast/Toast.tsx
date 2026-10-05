import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './Toast.module.css';

type ToastProps = {
  /** 表示する文言。null で非表示。同じ文言でも key を変えると出し直す */
  message: string | null;
  onHide: () => void;
  /** 表示している時間（ミリ秒） */
  duration?: number;
};

/** 画面中央に少しのあいだ出るお知らせ（チェックのアイコン付き）。操作は邪魔しない */
export function Toast({ message, onHide, duration = 1800 }: ToastProps) {
  const [shown, setShown] = useState<string | null>(null);
  const [leaving, setLeaving] = useState(false);

  if (message && message !== shown) {
    setShown(message);
    setLeaving(false);
  }

  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => setLeaving(true), duration);
    return () => window.clearTimeout(timer);
  }, [message, duration]);

  if (!shown) return null;

  return createPortal(
    <div className={styles.layer} role="status" aria-live="polite">
      <div
        className={`${styles.toast} ${leaving ? styles.leaving : ''}`}
        onAnimationEnd={() => {
          if (!leaving) return;
          setShown(null);
          onHide();
        }}
      >
        <svg className={styles.icon} width="56" height="56" viewBox="0 0 56 56" fill="none" aria-hidden="true">
          <circle cx="28" cy="28" r="25.5" stroke="currentColor" strokeWidth="5" />
          <path d="M16.5 28.5l8 8 15-15" stroke="currentColor" strokeWidth="5" />
        </svg>
        <p className={styles.message}>{shown}</p>
      </div>
    </div>,
    document.body,
  );
}
