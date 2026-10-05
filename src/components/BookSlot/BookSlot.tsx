import type { HTMLAttributes, Ref } from 'react';
import { BookNumber } from '../BookNumber/BookNumber';
import { useCover } from '../../state/covers';
import { coverPlaceholder, isBookFilled, type Book } from '../../state/project';
import styles from './BookSlot.module.css';

type BookSlotProps = Omit<HTMLAttributes<HTMLButtonElement>, 'onClick'> & {
  book: Book;
  index: number;
  /** list: 感想ありの横長カード / grid: 感想なしの縦長カード */
  variant: 'list' | 'grid';
  onOpen: () => void;
  ref?: Ref<HTMLButtonElement>;
  'data-dragging'?: boolean;
};

/** 作品の登録画面の 1 枠。タップで入力モーダルを開く */
export function BookSlot({ book, index, variant, onOpen, className, ...rest }: BookSlotProps) {
  const cover = useCover(book.coverId);
  const filled = isBookFilled(book);
  const isList = variant === 'list';

  return (
    <button
      type="button"
      className={`${isList ? styles.list : styles.grid} ${className ?? ''}`}
      onClick={onOpen}
      aria-label={`${index + 1}冊目${book.title ? `：${book.title}` : ''}を${filled ? '編集' : '登録'}する`}
      {...rest}
    >
      {isList ? (
        <span className={styles.numberColumn}>
          <BookNumber value={index + 1} />
        </span>
      ) : (
        <BookNumber value={index + 1} size="S" />
      )}
      <img
        className={`${styles.cover} ${cover ? styles.coverImage : ''}`}
        src={cover ?? coverPlaceholder}
        alt=""
        draggable={false}
      />
      <span className={styles.text}>
        <span className={styles.title}>{book.title || 'タイトル'}</span>
        <span className={styles.author}>{book.author || '作者'}</span>
        {isList && <span className={styles.comment}>{book.comment || '感想'}</span>}
      </span>
      <span className={styles.action}>{filled ? '編集する' : '+ 登録する'}</span>
    </button>
  );
}
