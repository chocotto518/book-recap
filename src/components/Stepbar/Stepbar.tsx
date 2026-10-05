import { Fragment, type CSSProperties } from 'react';
import styles from './Stepbar.module.css';

type StepbarProps = {
  steps: readonly string[];
  /** 0 始まりの現在ステップ */
  current: number;
  /** ステップ間の線の長さ（Figma：2ステップは 100px）。width を指定したときは使わない */
  lineWidth?: number;
  /** 全体の幅を固定する（Figma：3ステップは 304px）。線は残りの幅を等分する */
  width?: number;
  /** 丸・ラベルと線の間隔（Figma：2ステップは 4px、3ステップは 7px） */
  gap?: number;
  /** 渡すと、終わったステップ（チェックの付いたステップ）をタップしてそこへ戻れる */
  onStepClick?: (step: number) => void;
};

type StepState = 'done' | 'active' | 'todo';

const badgeClass: Record<StepState, string> = {
  done: styles.badgeDone,
  active: styles.badgeActive,
  todo: styles.badge,
};

export function Stepbar({ steps, current, lineWidth = 100, width, gap = 4, onStepClick }: StepbarProps) {
  const style = { gap, width, '--line-width': width ? undefined : `${lineWidth}px` } as CSSProperties;
  return (
    <ol className={`${styles.stepbar} ${width ? styles.fixedWidth : ''}`} style={style}>
      {steps.map((label, i) => {
        const state: StepState = i < current ? 'done' : i === current ? 'active' : 'todo';
        const content = (
          <>
            <span className={badgeClass[state]}>
              {state === 'done' ? (
                <img src={`${import.meta.env.BASE_URL}icons/check.svg`} alt="完了" width={20} height={20} />
              ) : (
                i + 1
              )}
            </span>
            <span className={state === 'active' ? styles.labelActive : styles.label}>{label}</span>
          </>
        );
        return (
          <Fragment key={label}>
            {i > 0 && <li className={i <= current ? styles.lineFilled : styles.line} aria-hidden="true" />}
            <li className={styles.item} aria-current={state === 'active' ? 'step' : undefined}>
              {state === 'done' && onStepClick ? (
                <button
                  type="button"
                  className={`${styles.step} ${styles.stepButton}`}
                  onClick={() => onStepClick(i)}
                  aria-label={`${label}に戻る`}
                >
                  {content}
                </button>
              ) : (
                <span className={styles.step}>{content}</span>
              )}
            </li>
          </Fragment>
        );
      })}
    </ol>
  );
}
