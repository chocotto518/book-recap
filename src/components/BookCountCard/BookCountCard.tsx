import styles from './BookCountCard.module.css';

type BookCountCardProps = {
  count: number;
  /** リスト型のみ：感想の文字数上限 */
  commentMaxLength?: number;
  thumbnailSrc: string;
  /** S: 一覧のカード / L: 選択後に拡大表示したカード */
  size?: 'S' | 'L';
  /** 渡したときだけボタンとして振る舞う */
  onSelect?: () => void;
  'data-flip'?: string;
};

export function BookCountCard({
  count,
  commentMaxLength,
  thumbnailSrc,
  size = 'S',
  onSelect,
  'data-flip': flipKey,
}: BookCountCardProps) {
  const content = (
    <>
      <span className={styles.label}>
        <span className={styles.count}>
          <span className={styles.number}>{count}</span>
          <span className={styles.unit}>冊</span>
        </span>
        {commentMaxLength !== undefined && <span className={styles.limit}>感想{commentMaxLength}字まで</span>}
      </span>
      <img className={styles.thumbnail} src={thumbnailSrc} alt="" width={1080} height={1440} />
    </>
  );
  const className = `${styles.card} ${size === 'L' ? styles.large : ''}`;

  return onSelect ? (
    <button type="button" className={className} onClick={onSelect} data-flip={flipKey}>
      {content}
    </button>
  ) : (
    <div className={className} data-flip={flipKey}>
      {content}
    </div>
  );
}
