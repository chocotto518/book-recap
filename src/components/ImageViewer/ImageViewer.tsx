import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { pushOverlay } from '../overlayStack';
import styles from './ImageViewer.module.css';

type ImageViewerProps = {
  open: boolean;
  onClose: () => void;
  /** 全画面に大きく出す画像（3:4） */
  children: ReactNode;
};

/** 画像を画面いっぱいに表示する。どこをタップしても・Esc でも閉じる（仮デザイン） */
export function ImageViewer({ open, onClose, children }: ImageViewerProps) {
  useEffect(() => {
    if (!open) return;
    const overlay = pushOverlay();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && overlay.isTop()) onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      overlay.remove();
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className={styles.backdrop} role="dialog" aria-modal="true" aria-label="画像の全画面表示" onClick={onClose}>
      <button type="button" className={styles.close} aria-label="閉じる" onClick={onClose}>
        <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
          <path d="M5 5l14 14M19 5L5 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
      <div className={styles.image}>{children}</div>
    </div>,
    document.body,
  );
}
