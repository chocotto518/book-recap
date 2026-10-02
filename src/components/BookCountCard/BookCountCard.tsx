import styles from './BookCountCard.module.css';

type BookCountCardProps = {
  count: number;
  /** リスト型のみ：感想の文字数上限 */
  commentMaxLength?: number;
  thumbnailSrc: string;
  onSelect: () => void;
};

export function BookCountCard({ count, commentMaxLength, thumbnailSrc, onSelect }: BookCountCardProps) {
  return (
    <button type="button" className={styles.card} onClick={onSelect}>
      <span className={styles.label}>
        <span className={styles.count}>
          <span className={styles.number}>{count}</span>
          <span className={styles.unit}>冊</span>
        </span>
        {commentMaxLength !== undefined && <span className={styles.limit}>感想{commentMaxLength}字まで</span>}
      </span>
      <img className={styles.thumbnail} src={thumbnailSrc} alt="" width={1080} height={1440} />
    </button>
  );
}
