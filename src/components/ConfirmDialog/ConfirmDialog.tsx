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
  /** 省略するとボタンは 1 つ（お知らせ）。背景タップ・Esc は onConfirm になる */
  onCancel?: () => void;
  confirmLabel?: ReactNode;
  cancelLabel?: ReactNode;
  /** キャラクターのアニメーションを出す（リセット） */
  character?: boolean;
};

/** 確認（いいえ／はい）とお知らせ（閉じる）のポップアップ */
export function ConfirmDialog({
  open,
  message,
  onConfirm,
  onCancel,
  confirmLabel = 'はい',
  cancelLabel = 'いいえ',
  character = false,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={onCancel ?? onConfirm} label={message}>
      <div className={styles.content}>
        <p className={styles.message}>{message}</p>
        {character && <LottiePlayer load={loadCharacter} width={102} height={156} className={styles.character} />}
        <div className={onCancel ? styles.actions : undefined}>
          {onCancel && (
            <Button variant="outline" size="M" onClick={onCancel}>
              {cancelLabel}
            </Button>
          )}
          <Button size="M" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
