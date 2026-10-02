import { Fragment, type CSSProperties } from 'react';
import styles from './Stepbar.module.css';

type StepbarProps = {
  steps: readonly string[];
  /** 0 始まりの現在ステップ */
  current: number;
  /** ステップ間の線の長さ（Figma：2ステップは 100px、3ステップは 60px） */
  lineWidth?: number;
  /** 丸・ラベルと線の間隔（Figma：2ステップは 4px、3ステップは 7px） */
  gap?: number;
};

type StepState = 'done' | 'active' | 'todo';

const badgeClass: Record<StepState, string> = {
  done: styles.badgeDone,
  active: styles.badgeActive,
  todo: styles.badge,
};

export function Stepbar({ steps, current, lineWidth = 100, gap = 4 }: StepbarProps) {
  return (
    <ol className={styles.stepbar} style={{ gap, '--line-width': `${lineWidth}px` } as CSSProperties}>
      {steps.map((label, i) => {
        const state: StepState = i < current ? 'done' : i === current ? 'active' : 'todo';
        return (
          <Fragment key={label}>
            {i > 0 && <li className={i <= current ? styles.lineFilled : styles.line} aria-hidden="true" />}
            <li className={styles.step} aria-current={state === 'active' ? 'step' : undefined}>
              <span className={badgeClass[state]}>
                {state === 'done' ? (
                  <img src={`${import.meta.env.BASE_URL}icons/check.svg`} alt="完了" width={20} height={20} />
                ) : (
                  i + 1
                )}
              </span>
              <span className={state === 'active' ? styles.labelActive : styles.label}>{label}</span>
            </li>
          </Fragment>
        );
      })}
    </ol>
  );
}
