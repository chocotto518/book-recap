import { Fragment } from 'react';
import styles from './Stepbar.module.css';

type StepbarProps = {
  steps: readonly string[];
  /** 0 始まりの現在ステップ */
  current: number;
};

export function Stepbar({ steps, current }: StepbarProps) {
  return (
    <ol className={styles.stepbar}>
      {steps.map((label, i) => {
        const active = i === current;
        return (
          <Fragment key={label}>
            {i > 0 && <li className={styles.line} aria-hidden="true" />}
            <li className={styles.step} aria-current={active ? 'step' : undefined}>
              <span className={active ? styles.badgeActive : styles.badge}>{i + 1}</span>
              <span className={active ? styles.labelActive : styles.label}>{label}</span>
            </li>
          </Fragment>
        );
      })}
    </ol>
  );
}
