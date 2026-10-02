import type { ButtonHTMLAttributes } from 'react';
import styles from './Button.module.css';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** primary: 塗りの大ボタン / text: グレー文字だけのボタン */
  variant?: 'primary' | 'text';
};

export function Button({ variant = 'primary', className, type = 'button', ...rest }: ButtonProps) {
  return <button type={type} className={`${styles[variant]} ${className ?? ''}`} {...rest} />;
}
