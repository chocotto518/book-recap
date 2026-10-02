import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import styles from './Modal.module.css';

type ModalProps = {
  open: boolean;
  onClose: () => void;
  /** 読み上げ用の名前 */
  label: string;
  children: ReactNode;
};

/** 下からせり上がる全画面モーダル。閉じるときは下へ戻ってから消える */
export function Modal({ open, onClose, label, children }: ModalProps) {
  const [mounted, setMounted] = useState(open);

  if (open && !mounted) setMounted(true);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <div
      className={`${styles.modal} ${open ? styles.open : styles.closing}`}
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
