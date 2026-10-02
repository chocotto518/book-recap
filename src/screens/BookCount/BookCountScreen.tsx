import { BookCountCard } from '../../components/BookCountCard/BookCountCard';
import { Header } from '../../components/Header/Header';
import { Stepbar } from '../../components/Stepbar/Stepbar';
import { TEMPLATE_SETTINGS_STEPS, TEMPLATE_SETTINGS_TITLE } from '../../constants/flow';
import { bookCountOptions, COMMENT_MAX_LENGTH, type TemplateType } from '../../constants/template';
import styles from './BookCountScreen.module.css';

type BookCountScreenProps = {
  templateType: TemplateType;
  onBack: () => void;
  onSelect: (count: number) => void;
};

/** テンプレート設定 step2：作品数の選択 */
export function BookCountScreen({ templateType, onBack, onSelect }: BookCountScreenProps) {
  return (
    <div className={styles.screen}>
      <Header title={TEMPLATE_SETTINGS_TITLE} onBack={onBack} />
      <main className={styles.main}>
        <Stepbar steps={TEMPLATE_SETTINGS_STEPS} current={1} />
        <section className={styles.content} aria-labelledby="book-count-heading">
          <div className={styles.heading}>
            <h2 id="book-count-heading" className={styles.question}>
              何冊紹介しますか？
            </h2>
            <p className={styles.hint}>タップで選択</p>
          </div>
          <div className={styles.options}>
            {bookCountOptions(templateType).map((count) => (
              <BookCountCard
                key={count}
                count={count}
                commentMaxLength={templateType === 'list' ? COMMENT_MAX_LENGTH[count] : undefined}
                thumbnailSrc={`${import.meta.env.BASE_URL}images/count-${templateType}-${count}.png`}
                onSelect={() => onSelect(count)}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
