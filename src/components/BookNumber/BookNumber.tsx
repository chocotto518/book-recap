import styles from './BookNumber.module.css';

/** 何冊目かを示す四角い番号。M: 24px（リスト・モーダル） / S: 18px（グリッド） */
export function BookNumber({ value, size = 'M' }: { value: number; size?: 'M' | 'S' }) {
  return <span className={size === 'M' ? styles.m : styles.s}>{value}</span>;
}
