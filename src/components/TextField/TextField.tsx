import { useId } from 'react';
import styles from './TextField.module.css';

type TextFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** 「※必須」を表示する */
  required?: boolean;
  maxLength?: number;
  /** 複数行の入力欄（感想など） */
  multiline?: boolean;
  /** 文字数の上限と今の文字数を表示する */
  showCount?: boolean;
};

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  required,
  maxLength,
  multiline,
  showCount,
}: TextFieldProps) {
  const id = useId();
  const length = [...value].length;
  const over = maxLength !== undefined && length > maxLength;
  const common = {
    id,
    value,
    placeholder,
    required,
    maxLength,
    onChange: (e: { target: { value: string } }) => onChange(e.target.value),
  };

  return (
    <div className={styles.field}>
      <div className={styles.labelRow}>
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
        {required && <span className={styles.required}>※必須</span>}
        {showCount && maxLength !== undefined && (
          <span className={`${styles.count} ${over ? styles.countOver : ''}`}>
            {length}/{maxLength}
          </span>
        )}
      </div>
      {multiline ? (
        <textarea className={`${styles.input} ${styles.textarea}`} {...common} />
      ) : (
        <input className={styles.input} type="text" {...common} />
      )}
    </div>
  );
}
