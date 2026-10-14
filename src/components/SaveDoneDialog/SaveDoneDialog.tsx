import { Button } from '../Button/Button';
import { Dialog } from '../Dialog/Dialog';
import { LottiePlayer } from '../LottiePlayer/LottiePlayer';
import styles from './SaveDoneDialog.module.css';

const loadAnimation = () => import('../../assets/lottie/export-done.json');


type SaveDoneDialogProps = {
  open: boolean;
  /** 見出し（iPhone は共有シートでどれを選んだか分からないので「完了しました！」） */
  title: string;
  onClose: () => void;
  /** 「もう1枚作る」 */
  onCreateAnother: () => void;
};

/** 書き出し：保存したあとのポップアップ（335×364） */
export function SaveDoneDialog({ open, title, onClose, onCreateAnother }: SaveDoneDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} label={title}>
      <div className={styles.content}>
        <p className={styles.title}>{title}</p>
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
