import type { ReactNode } from 'react';
import { Button } from '../Button/Button';
import { Dialog } from '../Dialog/Dialog';
import { LottiePlayer } from '../LottiePlayer/LottiePlayer';
import styles from './ConfirmDialog.module.css';

const loadCharacter = () => import('../../assets/lottie/reset-character.json');

type ConfirmDialogProps = {
  open: boolean;
  /** 本文（改行は `\n`） */
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: ReactNode;
  cancelLabel?: ReactNode;
};

/** はい／いいえで答える確認のポップアップ（キャラクターのアニメーション付き） */
export function ConfirmDialog({
  open,
  message,
  onConfirm,
  onCancel,
  confirmLabel = 'はい',
  cancelLabel = 'いいえ',
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={onCancel} label={message}>
      <div className={styles.content}>
        <p className={styles.message}>{message}</p>
        <LottiePlayer load={loadCharacter} width={102} height={156} className={styles.character} />
        <div className={styles.actions}>
          <Button variant="outline" size="M" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button size="M" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
