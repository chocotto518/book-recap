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
};

export function TextField({ label, value, onChange, placeholder, required, maxLength }: TextFieldProps) {
  const id = useId();
  return (
    <div className={styles.field}>
      <div className={styles.labelRow}>
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
        {required && <span className={styles.required}>※必須</span>}
      </div>
      <input
        id={id}
        className={styles.input}
        type="text"
        value={value}
        placeholder={placeholder}
        required={required}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
