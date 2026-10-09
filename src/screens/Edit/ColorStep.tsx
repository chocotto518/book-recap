import { useState, type CSSProperties } from 'react';
import { ColorCarousel } from '../../components/ColorCarousel/ColorCarousel';
import { RecapPreview } from '../../components/RecapPreview/RecapPreview';
import { PALETTES, type ColorId } from '../../render/colors';
import type { Project, Template } from '../../state/project';
import styles from './ColorStep.module.css';

type ColorStepProps = {
  project: Project;
  template: Template;
  onColorChange: (color: ColorId) => void;
  /** 中央のカードをタップしたとき（書き出しへ進む） */
  onConfirm: () => void;
};

/** カードの見た目の幅 303px を端末の画素密度で描ける解像度（最大 1080px） */
const previewScale = () => Math.min(1, (303 * (window.devicePixelRatio || 1)) / 1080);

/** 編集 step3：カラー選択。カードを横にスライドして選ぶ。カードの中は今の入力内容で描いたプレビュー */
export function ColorStep({ project, template, onColorChange, onConfirm }: ColorStepProps) {
  const current = Math.max(
    0,
    PALETTES.findIndex((p) => p.id === project.color),
  );
  const [peek, setPeek] = useState(current);
  const [scale] = useState(previewScale);

  return (
    <section className={styles.section} aria-label="カラー選択">
      <p className={styles.hint}>タップで選択</p>
      <div className={styles.carousel}>
        <ColorCarousel
          count={PALETTES.length}
          index={current}
          onIndexChange={(i) => onColorChange(PALETTES[i].id)}
          onPeek={setPeek}
          onSelectCurrent={onConfirm}
          labelOf={(i) => `${PALETTES[i].label}${i === current ? '（選択中）' : ''}`}
          renderCard={(i) => (
            <span className={styles.card}>
              <span className={styles.label}>{PALETTES[i].label}</span>
              <RecapPreview
                scale={scale}
                label={`${PALETTES[i].label}のプレビュー`}
                input={{
                  template,
                  palette: PALETTES[i],
                  theme: project.theme,
                  userName: project.userName,
                  books: project.books,
                  fillEmpty: false,
                }}
              />
            </span>
          )}
        />
      </div>
      <div className={styles.dots} role="radiogroup" aria-label="カラー">
        {PALETTES.map((p, i) => (
          <button
            key={p.id}
            type="button"
            role="radio"
            aria-checked={i === current}
            aria-label={p.label}
            className={`${styles.dot} ${i === peek ? styles.dotActive : ''}`}
            style={{ '--dot-color': p.accent } as CSSProperties}
            onClick={() => onColorChange(p.id)}
          />
        ))}
      </div>
    </section>
  );
}
