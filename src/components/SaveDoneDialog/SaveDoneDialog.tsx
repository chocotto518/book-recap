import { Button } from '../Button/Button';
import { Dialog } from '../Dialog/Dialog';
import { LottiePlayer } from '../LottiePlayer/LottiePlayer';
import styles from './SaveDoneDialog.module.css';

const loadAnimation = () => import('../../assets/lottie/export-done.json');

const TITLE = '端末に保存しました！';

type SaveDoneDialogProps = {
  open: boolean;
  onClose: () => void;
  /** 「もう1枚作る」 */
  onCreateAnother: () => void;
};

/** 書き出し：端末に保存したあとのポップアップ（335×364） */
export function SaveDoneDialog({ open, onClose, onCreateAnother }: SaveDoneDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} label={TITLE}>
      <div className={styles.content}>
        <p className={styles.title}>{TITLE}</p>
        <div className={styles.animation}>
          <LottiePlayer load={loadAnimation} width={287} height={196} overflowVisible />
        </div>
        <div className={styles.actions}>
          <Button size="M" onClick={onCreateAnother}>
            もう1枚作る
          </Button>
          <Button variant="outline" size="M" onClick={onClose}>
            閉じる
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
