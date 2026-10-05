import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import styles from './Dialog.module.css';
import { pushOverlay } from '../overlayStack';

type DialogProps = {
  open: boolean;
  onClose: () => void;
  /** 読み上げ用の名前 */
  label: string;
  children: ReactNode;
};

/** 画面中央にポップアップするモーダル。背景は暗くなり、背景をタップすると閉じる */
export function Dialog({ open, onClose, label, children }: DialogProps) {
  const [mounted, setMounted] = useState(open);

  if (open && !mounted) setMounted(true);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const overlay = pushOverlay();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && overlay.isTop()) onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      overlay.remove();
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <div
      className={`${styles.backdrop} ${open ? styles.open : styles.closing}`}
      data-scroll-container
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onAnimationEnd={(e) => {
        if (!open && e.target === e.currentTarget) setMounted(false);
      }}
    >
      <div className={styles.panel} role="dialog" aria-modal="true" aria-label={label}>
        {children}
      </div>
    </div>,
    document.body,
  );
}
