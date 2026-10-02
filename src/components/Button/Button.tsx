import type { ButtonHTMLAttributes } from 'react';
import styles from './Button.module.css';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** primary: 塗り / secondary: 白地に茶色の枠線 / outline: 白地にグレーの枠線 / text: グレー文字だけ */
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  /** L: 20px の大ボタン / M: 16px（モーダル内など） */
  size?: 'L' | 'M';
};

export function Button({ variant = 'primary', size = 'L', className, type = 'button', ...rest }: ButtonProps) {
  return (
    <button
      type={type}
      className={`${styles[variant]} ${variant !== 'text' && size === 'M' ? styles.sizeM : ''} ${className ?? ''}`}
      {...rest}
    />
  );
}
