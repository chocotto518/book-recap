import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import styles from './Modal.module.css';
import { pushOverlay } from '../overlayStack';

type ModalProps = {
  open: boolean;
  onClose: () => void;
  /** 読み上げ用の名前 */
  label: string;
  /** up: 下からせり上がる（閉じるときは下へ） / right: 右からスライドイン（閉じるときは右へ） */
  from?: 'up' | 'right';
  children: ReactNode;
};

/** 全画面モーダル。閉じるときは来た方向へ戻ってから消える */
export function Modal({ open, onClose, label, from = 'up', children }: ModalProps) {
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
      className={`${styles.modal} ${from === 'right' ? styles.fromRight : ''} ${open ? styles.open : styles.closing}`}
      role="dialog"
      aria-modal="true"
      aria-label={label}
      data-scroll-container
      onAnimationEnd={() => {
        if (!open) setMounted(false);
      }}
    >
      <div className={styles.inner}>{children}</div>
    </div>,
    document.body,
  );
}
