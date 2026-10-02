import { useRef, useState } from 'react';
import { BookCountCard } from '../../components/BookCountCard/BookCountCard';
import { Button } from '../../components/Button/Button';
import { Header } from '../../components/Header/Header';
import { Stepbar } from '../../components/Stepbar/Stepbar';
import { TEMPLATE_SETTINGS_STEPS, TEMPLATE_SETTINGS_TITLE } from '../../constants/flow';
import { bookCountOptions, COMMENT_MAX_LENGTH, type TemplateType } from '../../constants/template';
import { useFlip } from '../../hooks/useFlip';
import styles from './BookCountScreen.module.css';

type BookCountScreenProps = {
  templateType: TemplateType;
  onBack: () => void;
  onConfirm: (count: number) => void;
};

/**
 * テンプレート設定 step2：作品数の選択
 * カードをタップするとその場で拡大して確認状態になり、「作品数の選択に戻る」で元の位置に縮む。
 */
export function BookCountScreen({ templateType, onBack, onConfirm }: BookCountScreenProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [collapsedFrom, setCollapsedFrom] = useState<number | null>(null);
  const gridScrollY = useRef(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const capture = useFlip(rootRef, [selected]);

  const cardProps = (count: number) => ({
    count,
    commentMaxLength: templateType === 'list' ? COMMENT_MAX_LENGTH[count] : undefined,
    thumbnailSrc: `${import.meta.env.BASE_URL}images/count-${templateType}-${count}.png`,
    'data-flip': `count-${count}`,
  });

  const expand = (count: number) => {
    gridScrollY.current = window.scrollY;
    capture(`count-${count}`, 0);
    setCollapsedFrom(null);
    setSelected(count);
  };

  const collapse = () => {
    if (selected === null) return;
    capture(`count-${selected}`, gridScrollY.current);
    setCollapsedFrom(selected);
    setSelected(null);
  };

  return (
    <div className={styles.screen} ref={rootRef}>
      <Header title={TEMPLATE_SETTINGS_TITLE} onBack={selected === null ? onBack : collapse} />
      <main className={styles.main}>
        <Stepbar steps={TEMPLATE_SETTINGS_STEPS} current={1} />
        {selected === null ? (
          <section className={styles.content} aria-labelledby="book-count-heading">
            <div className={`${styles.heading} ${collapsedFrom !== null ? styles.fadeIn : ''}`}>
              <h2 id="book-count-heading" className={styles.question}>
                何冊紹介しますか？
              </h2>
              <p className={styles.hint}>タップで選択</p>
            </div>
            <div className={styles.options}>
              {bookCountOptions(templateType).map((count) => (
                <div key={count} className={collapsedFrom !== null && collapsedFrom !== count ? styles.fadeIn : undefined}>
                  <BookCountCard {...cardProps(count)} onSelect={() => expand(count)} />
                </div>
              ))}
            </div>
          </section>
        ) : (
          <section className={styles.confirm} aria-label={`${selected}冊のテンプレート`}>
            <BookCountCard {...cardProps(selected)} size="L" />
            <div className={`${styles.actions} ${styles.fadeIn}`}>
              <Button onClick={() => onConfirm(selected)}>このテンプレートで作成</Button>
              <Button variant="text" onClick={collapse}>
                作品数の選択に戻る
              </Button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
